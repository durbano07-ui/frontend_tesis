import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';
import '../../medical.css'; // Estilos unificados médicos y psicológicos
import '../../dentist.css'; // Estilos específicos de odontología
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
    Filter,
    Save,
    History,
    FileText,
    FileCheck,
    Printer,
    Plus,
    Minus,
    Pencil,
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
    UserCheck,
    UserPlus,
    HeartHandshake,
    Shield,
    CalendarCheck,
    CalendarDays,
    Info,
    TrendingUp,
    BookOpen,
    Package,
    Trash2,
    RefreshCw,
    PlusCircle,
    Edit,
    Hash,
    Clock,
    BriefcaseMedical,
    MapPin,
    Eye,
    EyeOff,
    Mail,
    Pill
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

// Mapeos para traducir de notación FDI (frontend) a Sistema Universal (base de datos 1-32)
const fdiToUniversal = {
    18: 1, 17: 2, 16: 3, 15: 4, 14: 5, 13: 6, 12: 7, 11: 8,
    21: 9, 22: 10, 23: 11, 24: 12, 25: 13, 26: 14, 27: 15, 28: 16,
    38: 17, 37: 18, 36: 19, 35: 20, 34: 21, 33: 22, 32: 23, 31: 24,
    41: 25, 42: 26, 43: 27, 44: 28, 45: 29, 46: 30, 47: 31, 48: 32
};

const getCarillaDbName = (toothNum, face) => {
    if (face === 'top') return 'Vestibular';
    if (face === 'bottom') return 'Lingual/Palatal';
    if (face === 'center') return 'Oclusal';

    const firstDigit = Math.floor(toothNum / 10);
    const isRightSide = (firstDigit === 1 || firstDigit === 4);

    if (isRightSide) {
        return face === 'right' ? 'Mesial' : 'Distal';
    } else {
        return face === 'left' ? 'Mesial' : 'Distal';
    }
};

const getSvgFaceName = (toothNum, carillaName) => {
    if (carillaName === 'vestibular') return 'top';
    if (carillaName === 'lingual/palatal' || carillaName === 'lingual') return 'bottom';
    if (carillaName === 'oclusal') return 'center';

    const firstDigit = Math.floor(toothNum / 10);
    const isRightSide = (firstDigit === 1 || firstDigit === 4);

    if (isRightSide) {
        if (carillaName === 'mesial') return 'right';
        if (carillaName === 'distal') return 'left';
    } else {
        if (carillaName === 'mesial') return 'left';
        if (carillaName === 'distal') return 'right';
    }
    return null;
};

const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getInsumoDescontado = (cantidadGastada) => {
    if (!cantidadGastada) return 0;
    const valor = String(cantidadGastada).trim();
    const match = valor.match(/^\d+(\.\d+)?/);
    if (match) {
        const cantidad = parseFloat(match[0]);
        return Math.max(1, Math.round(cantidad));
    }
    return 1; // Default backend behavior
};


const Odontologo_page = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const doctorNameText = user?.name ? user.name.toUpperCase() : 'PROFESIONAL RESPONSABLE';

    // Estado de pestañas activas
    // 'ficha' | 'odontograma' | 'diario' | 'evolucion' | 'historial'
    const [activeTab, setActiveTab] = useState('ficha');

    // Appointments states
    const [citasList, setCitasList] = useState([]);
    const [citasLoading, setCitasLoading] = useState(false);
    const [citasDate, setCitasDate] = useState(new Date().toISOString().slice(0, 10));
    const [citasPage, setCitasPage] = useState(1);
    const CITAS_PER_PAGE = 12;
    const [completingCita, setCompletingCita] = useState(null);
    const [notasDoctor, setNotasDoctor] = useState('');
    const [savingNotas, setSavingNotas] = useState(false);

    // Menú colapsable y estados visuales
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });

    // Paciente seleccionado
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Draft local & Offline resilience
    const patientId = selectedPatient?.id_usuario || selectedPatient?.id;
    const { isOffline, saveDraft, loadDraft, clearDraft, draftLastSaved } = useClinicalDraft('odontologia', user?.id, patientId);

    // Modales de búsqueda y registro
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
    // 1. ESTADOS DE FICHA ODONTOLÓGICA
    // ==========================================
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const steps = [
        { key: 'motivo', label: '1. Motivo y Antecedentes' },
        { key: 'examen_clinico', label: '2. Examen Estomatológico' },
        { key: 'periodontal', label: '3. Enf. Periodontal' },
        { key: 'diagnostico', label: '4. Diag. y Tratamiento' },
        { key: 'odontograma', label: '5. Odontograma' },
        { key: 'insumos', label: '6. Insumos y Consumos' },
        { key: 'prescripcion', label: '7. Prescripción Médica' }
    ];
    const handlePrevStep = () => {
        if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
    };
    const handleNextStep = () => {
        if (currentStepIndex < steps.length - 1) setCurrentStepIndex(currentStepIndex + 1);
    };
    const handleSaveAndContinue = async () => {
        const activeStepKey = steps[currentStepIndex].key;
        if (activeStepKey === 'insumos' || activeStepKey === 'prescripcion') {
            if (currentStepIndex < steps.length - 1) {
                handleNextStep();
            } else {
                handleCloseFichaForm();
            }
            return;
        }
        if (activeStepKey === 'odontograma') {
            const success = await handleSaveOdontograma();
            if (success) {
                handleNextStep();
            }
        } else {
            const success = await handleSaveFichaSection(activeStepKey);
            if (success) {
                handleNextStep();
            }
        }
    };
    const handleSaveAndFinish = async (generateCertificate = false) => {
        const isCert = generateCertificate === true;
        setFichaSaving(true);
        try {
            // Guardar sección de diagnóstico / parte diario con el tipo de atención correspondiente
            await handleSaveFichaSection('diagnostico', isCert ? 'certificadomedico' : null);

            const activeStepKey = steps[currentStepIndex].key;
            if (activeStepKey === 'odontograma') {
                await handleSaveOdontograma();
            }

            handleCloseFichaForm();

            if (isCert && selectedPatient) {
                showSystemToast("Atención registrada. Generando certificado oficial...");
                const recordToPrint = {
                    type: 'parte_diario',
                    id: fichaRawData.parte_diario?.id,
                    detalle_diagnostico: fichaForm.detalle_diagnostico || fichaForm.detalle_motivo || 'Evaluación Odontológica',
                    procedimiento: fichaForm.procedimiento || 'Profilaxis',
                    fecha: getLocalDateString()
                };
                handlePrintSessionCertificate(recordToPrint);
            } else {
                showSystemToast("Atención médica guardada exitosamente. Podrá otorgar el certificado en cualquier momento desde la pestaña Evolución.");
            }
        } catch (err) {
            console.error("Error al finalizar la atención:", err);
            showSystemToast("Error al guardar la atención médica.");
        } finally {
            setFichaSaving(false);
        }
    };

    const [fichaLoading, setFichaLoading] = useState(false);
    const [fichaSaving, setFichaSaving] = useState(false);
    const [saveFeedback, setSaveFeedback] = useState({ show: false, success: true, title: '', message: '' });

    // Estados para 3D Book - Odontología
    const [areaHistories, setAreaHistories] = useState({ odontologia: [] });
    const [areaHistoriesLoading, setAreaHistoriesLoading] = useState(false);
    const [activeBookArea, setActiveBookArea] = useState('odontologia');
    const [activeBookRecord, setActiveBookRecord] = useState(null);

    // Estado de modal de confirmación custom
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null
    });

    const [fichaRawData, setFichaRawData] = useState({
        motivo: null,
        examen: null,
        periodontal: null,
        parte_diario: null
    });

    const [fichaForm, setFichaForm] = useState({
        // 1. Motivo Consulta y Antecedentes
        detalle_motivo: '',
        ultima_visita_fecha: getLocalDateString(),
        algun_tratamiento: 'no',
        detalle_tratamiento: '',
        algun_medicamento: 'no',
        detalle_medicamento: '',

        // 2. Examen Estomatológico (Tejidos Blandos)
        piel: 'normal',
        labios: 'normal',
        carrillos: 'normal',
        paladar: 'normal',
        piso_de_la_boca: 'normal',
        lengua: 'normal',
        glándulas_salivales: 'normal',
        ganglios: 'normal',
        tejido_muscular: 'normal',
        atm: 'normal',
        maxilar_superior: 'normal',
        maxilar_inferior: 'normal',
        observaciones: '',

        // 3. Enfermedad Periodontal
        placa_bacteriana: 'no',
        calculos_dentales: 'no',
        bolsa_periodontal: 'no',
        movilidad_dental: 'no',

        tipo_atencion: 'primaria',
        tipo_atencion2: 'curativo',
        detalle_diagnostico: '',
        procedimiento: 'Profilaxis',
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

    // Control de visibilidad del Examen Estomatológico (Tejidos Blandos)
    const [showCustomParametros, setShowCustomParametros] = useState(false);
    const hasCustomParametros = ['piel', 'labios', 'carrillos', 'paladar', 'piso_de_la_boca', 'lengua', 'glándulas_salivales', 'ganglios', 'tejido_muscular', 'atm', 'maxilar_superior', 'maxilar_inferior'].some(
        key => fichaForm[key] && fichaForm[key] !== 'normal'
    );

    // ==========================================
    // 2. ESTADOS DEL ODONTOGRAMA INTERACTIVO
    // ==========================================
    const [selectedStateTool, setSelectedStateTool] = useState('caries'); // sano | caries | obturado | corona | extraido | ausente
    const [odontogramaLoading, setOdontogramaLoading] = useState(false);
    const [odontogramaSaving, setOdontogramaSaving] = useState(false);

    // Database mapped state caches
    const [odontogramaEstados, setOdontogramaEstados] = useState([]);
    const [dentalCatalog, setDentalCatalog] = useState([]);
    const [patientOdontograma, setPatientOdontograma] = useState(null);

    // Inicializar los 32 dientes del adulto (FDI notation)
    const upperRightTeeth = [18, 17, 16, 15, 14, 13, 12, 11];
    const upperLeftTeeth = [21, 22, 23, 24, 25, 26, 27, 28];
    const lowerLeftTeeth = [31, 32, 33, 34, 35, 36, 37, 38];
    const lowerRightTeeth = [48, 47, 46, 45, 44, 43, 42, 41];

    const initialTeethState = () => {
        const teeth = {};
        const allTeeth = [...upperRightTeeth, ...upperLeftTeeth, ...lowerLeftTeeth, ...lowerRightTeeth];
        allTeeth.forEach(num => {
            teeth[num] = {
                top: 'sano',
                bottom: 'sano',
                left: 'sano',
                right: 'sano',
                center: 'sano',
                ausente: false
            };
        });
        return teeth;
    };

    const [odontogramaState, setOdontogramaState] = useState(initialTeethState());

    // ==========================================
    // 3. ESTADOS DE PARTE DIARIO (CONSULTAS DENTALES)
    // ==========================================
    const [parteDiarioDate, setParteDiarioDate] = useState(getLocalDateString());
    const [parteDiarioList, setParteDiarioList] = useState([]);
    const [parteDiarioLoading, setParteDiarioLoading] = useState(false);

    // ==========================================
    // 4. ESTADOS DE SESIONES DE EVOLUCIÓN DENTAL
    // ==========================================
    const [evolucionList, setEvolucionList] = useState([]);
    const [evolucionLoading, setEvolucionLoading] = useState(false);
    const [evolucionForm, setEvolucionForm] = useState({
        fecha: getLocalDateString(),
        detalle_tratamiento: '',
        detalle_procedimiento: 'Evolución clínica odontológica',
        prescripción_farmaceutica: 'Ninguna'
    });

    // ==========================================
    // 5. ESTADOS DE HISTORIAL GENERAL DENTAL
    // ==========================================
    const [historialList, setHistorialList] = useState([]);
    const [historialType, setHistorialType] = useState('all'); // all | evolucion | diario
    const [historialSearch, setHistorialSearch] = useState('');
    const [historialDate, setHistorialDate] = useState('');
    const [activeReportSubTab, setActiveReportSubTab] = useState('diario');
    const [reportCitasFecha, setReportCitasFecha] = useState(new Date().toISOString().slice(0, 10));
    const [reportCitasEstado, setReportCitasEstado] = useState('all');
    const [reportCitasList, setReportCitasList] = useState([]);
    const [reportCitasLoading, setReportCitasLoading] = useState(false);

    // ==========================================
    // 6. ESTADOS DE INSUMOS MÉDICOS
    // ==========================================
    const [insumosCatalogo, setInsumosCatalogo] = useState([]);
    const [insumosPacienteList, setInsumosPacienteList] = useState([]);
    const [insumosLoading, setInsumosLoading] = useState(false);
    // Modal catálogo (add/edit)
    const [isAddInsumoModalOpen, setIsAddInsumoModalOpen] = useState(false);
    const [insumoForm, setInsumoForm] = useState({ id: null, nombre: '', stock: '' });
    const [insumoFormLoading, setInsumoFormLoading] = useState(false);
    // Modal Ajuste Rápido de Stock (Ingreso / Egreso)
    const [isQuickStockModalOpen, setIsQuickStockModalOpen] = useState(false);
    const [quickStockTarget, setQuickStockTarget] = useState(null);
    const [quickStockType, setQuickStockType] = useState('add'); // 'add' | 'subtract'
    const [quickStockAmount, setQuickStockAmount] = useState(1);
    const [quickStockLoading, setQuickStockLoading] = useState(false);
    // Modal asignación a paciente
    const [isAssignInsumoModalOpen, setIsAssignInsumoModalOpen] = useState(false);
    const [consumoForm, setConsumoForm] = useState({ id_usuario_paciente: '', id_insumo: '', cantidad_gastada: '1' });
    const [consumoFormLoading, setConsumoFormLoading] = useState(false);
    // Formulario inline para el Paso 6 del modal clínico
    const [inlineInsumoForm, setInlineInsumoForm] = useState({ id_insumo: '', cantidad_gastada: '1' });
    const [inlineInsumoLoading, setInlineInsumoLoading] = useState(false);
    const [sessionInsumoIds, setSessionInsumoIds] = useState([]);
    const [insumoPatientSearch, setInsumoPatientSearch] = useState('');
    const [insumoPatientResults, setInsumoPatientResults] = useState([]);
    const [insumoPatientSearchLoading, setInsumoPatientSearchLoading] = useState(false);
    const [insumoSelectedPatient, setInsumoSelectedPatient] = useState(null);
    const [insumoSearchQuery, setInsumoSearchQuery] = useState('');
    const [onlyLowStockInsumos, setOnlyLowStockInsumos] = useState(false);
    const [showInsumoFilters, setShowInsumoFilters] = useState(false);
    const [insumoConsumoSearchQuery, setInsumoConsumoSearchQuery] = useState('');
    const [catalogCurrentPage, setCatalogCurrentPage] = useState(1);
    const [consumptionCurrentPage, setConsumptionCurrentPage] = useState(1);

    useEffect(() => {
        setCatalogCurrentPage(1);
    }, [insumoSearchQuery, onlyLowStockInsumos]);

    useEffect(() => {
        setConsumptionCurrentPage(1);
    }, [insumoConsumoSearchQuery]);

    // Modal reporte de consumos
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [reportYear, setReportYear] = useState(new Date().getFullYear());
    const [reportInsumosFecha, setReportInsumosFecha] = useState(new Date().toISOString().slice(0, 10));
    const [allParteDiarioForDiagnosis, setAllParteDiarioForDiagnosis] = useState([]);
    const [reportLoading, setReportLoading] = useState(false);

    // Modal reporte mensual general (Historial)
    const [isGeneralReportModalOpen, setIsGeneralReportModalOpen] = useState(false);
    const [genReportMonth, setGenReportMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [genReportYear, setGenReportYear] = useState(new Date().getFullYear());
    const [reportMensualFecha, setReportMensualFecha] = useState(new Date().toISOString().slice(0, 7));
    const [genReportLoading, setGenReportLoading] = useState(false);
    const [genReportData, setGenReportData] = useState(null);

    const showSystemToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3400);
    };

    const toggleAccordion = (key) => {
        setActiveAccordion(prev => (prev === key ? '' : key));
    };

    // Catálogo de Procedimientos Odontológicos
    const [proceduresCatalog, setProceduresCatalog] = useState([]);
    const [procedureSearchQuery, setProcedureSearchQuery] = useState('');
    const [newProcedureName, setNewProcedureName] = useState('');
    const [procedureLoading, setProcedureLoading] = useState(false);

    const fetchProceduresCatalog = async () => {
        setProcedureLoading(true);
        try {
            const response = await api.get('/odontologia/procedimientos');
            setProceduresCatalog(response.data.data || []);
        } catch (err) {
            console.error('Error cargando procedimientos odontológicos:', err);
        } finally {
            setProcedureLoading(false);
        }
    };

    const handleAddProcedure = async (e) => {
        e.preventDefault();
        if (!newProcedureName.trim()) return;
        try {
            await api.post('/odontologia/procedimientos', {
                nombre_procedimiento: newProcedureName.trim()
            });
            setNewProcedureName('');
            showSystemToast('Procedimiento registrado en el catálogo.');
            fetchProceduresCatalog();
        } catch (err) {
            console.error('Error al agregar procedimiento:', err);
            showSystemToast(err.response?.data?.message || 'Error al guardar el procedimiento.');
        }
    };

    const handleDeleteProcedure = (id) => {
        setConfirmModal({
            show: true,
            title: 'Eliminar Procedimiento',
            message: '¿Estás seguro de que deseas eliminar este procedimiento del catálogo?',
            onConfirm: async () => {
                try {
                    await api.delete(`/odontologia/procedimientos/${id}`);
                    showSystemToast('Procedimiento eliminado.');
                    fetchProceduresCatalog();
                } catch (err) {
                    console.error('Error al eliminar procedimiento:', err);
                    showSystemToast('Error al eliminar el procedimiento.');
                }
            }
        });
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
                setIsFichaModalOpen(true);
            }
        } catch (err) {
            console.error(err);
            setRegisterError(err.response?.data?.message || 'Error al registrar. Verifica el correo institucional o la cédula.');
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleSelectPatient = async (patient, forceOpenModal = false) => {
        setSelectedPatient(patient);
        setSessionInsumoIds([]);
        setIsPatientSearchOpen(false);
        setModalSearchCedula('');
        setModalSearchResults([]);
        showSystemToast(`Paciente seleccionado: ${patient.nombre_completo || patient.name || 'Paciente'}`);

        // Si la pestaña activa es evolución o historial, solo seleccionamos el paciente para consultar sus registros
        if ((activeTab === 'evolucion' || activeTab === 'historial') && !forceOpenModal) {
            return;
        }

        setActiveTab('ficha');
        setIsFichaModalOpen(true);

        const pId = patient.id_usuario || patient.id;
        if (pId) {
            try {
                await api.post('/citas-medicas/atender-paciente', {
                    id_usuario_paciente: pId,
                    rol_doctor: 'odontologo',
                    motivo: 'Atención en Odontología'
                });
                fetchCitasDoctor();
            } catch (err) {
                console.error("Error al auto-sincronizar cita:", err);
            }
        }
    };

    const handleCloseFichaForm = () => {
        setIsFichaModalOpen(false);
        setSelectedPatient(null);
        setSessionInsumoIds([]);
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

    useEffect(() => {
        fetchEstados();
        fetchDentalCatalog();
        fetchProceduresCatalog();
    }, []);

    useEffect(() => {
        if (activeTab === 'procedimientos') {
            fetchProceduresCatalog();
        }
    }, [activeTab]);

    // ==========================================
    // EFECTOS DE CARGA AL SELECCIONAR PACIENTE
    // ==========================================
    useEffect(() => {
        if (selectedPatient) {
            setActiveBookArea('odontologia');
            setActiveBookRecord(null);
            const pid = selectedPatient.id_usuario || selectedPatient.id;
            fetchPatientFicha(pid);
            fetchOdontograma(pid);
            fetchEvoluciones(pid);
            fetchPatientHistoryByArea(pid);
            fetchCatalogoInsumos();
        } else {
            resetFichaForm();
            setOdontogramaState(initialTeethState());
            setEvolucionList([]);
            setActiveBookArea('odontologia');
            setActiveBookRecord(null);
            setAreaHistories({ odontologia: [] });
        }
    }, [selectedPatient]);

    const resetFichaForm = () => {
        setFichaRawData({
            motivo: null,
            examen: null,
            periodontal: null,
            parte_diario: null
        });
        setFichaForm({
            detalle_motivo: '',
            ultima_visita_fecha: getLocalDateString(),
            algun_tratamiento: 'no',
            detalle_tratamiento: '',
            algun_medicamento: 'no',
            detalle_medicamento: '',
            piel: 'normal',
            labios: 'normal',
            carrillos: 'normal',
            paladar: 'normal',
            piso_de_la_boca: 'normal',
            lengua: 'normal',
            glándulas_salivales: 'normal',
            ganglios: 'normal',
            tejido_muscular: 'normal',
            atm: 'normal',
            maxilar_superior: 'normal',
            maxilar_inferior: 'normal',
            observaciones: '',
            placa_bacteriana: 'no',
            calculos_dentales: 'no',
            bolsa_periodontal: 'no',
            movilidad_dental: 'no',
            tipo_atencion: 'primaria',
            tipo_atencion2: 'curativo',
            detalle_diagnostico: '',
            procedimiento: 'Profilaxis'
        });
    };

    // ==========================================
    // CONTROLADORES DE API - FICHA CLÍNICA
    // ==========================================
    const fetchPatientFicha = async (patientId) => {
        setFichaLoading(true);
        try {
            const [motivoRes, examenRes, periodontalRes, diarioRes] = await Promise.all([
                api.get('/odontologia/motivo-consulta', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/examen', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/enfermedad-periodontal', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/parte-diario-odontologia', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } }))
            ]);

            const motivo = motivoRes.data?.data?.[0] || null;
            const examen = examenRes.data?.data?.[0] || null;
            const periodontal = periodontalRes.data?.data?.[0] || null;
            const parteDiario = diarioRes.data?.data?.[0] || null;

            const isTodayRecord = (dateStr) => {
                if (!dateStr) return false;
                try {
                    const recDate = new Date(dateStr).toISOString().slice(0, 10);
                    return recDate === today;
                } catch {
                    return false;
                }
            };

            setFichaRawData({
                motivo: (motivo && isTodayRecord(motivo.created_at)) ? motivo : null,
                examen: (examen && isTodayRecord(examen.created_at)) ? examen : null,
                periodontal: (periodontal && isTodayRecord(periodontal.created_at)) ? periodontal : null,
                parte_diario: (parteDiario && isTodayRecord(parteDiario.fecha || parteDiario.created_at)) ? parteDiario : null
            });

            const initialFormState = {
                detalle_motivo: motivo?.detalle_motivo || '',
                ultima_visita_fecha: motivo?.ultima_visita_fecha || today,
                algun_tratamiento: motivo?.algun_tratamiento || 'no',
                detalle_tratamiento: motivo?.detalle_tratamiento || '',
                algun_medicamento: motivo?.algun_medicamento || 'no',
                detalle_medicamento: motivo?.detalle_medicamento || '',
                piel: examen?.piel || 'normal',
                labios: examen?.labios || 'normal',
                carrillos: examen?.carrillos || 'normal',
                paladar: examen?.paladar || 'normal',
                piso_de_la_boca: examen?.piso_de_la_boca || 'normal',
                lengua: examen?.lengua || 'normal',
                glándulas_salivales: examen?.glándulas_salivales || 'normal',
                ganglios: examen?.ganglios || 'normal',
                tejido_muscular: examen?.tejido_muscular || 'normal',
                atm: examen?.atm || 'normal',
                maxilar_superior: examen?.maxilar_superior || 'normal',
                maxilar_inferior: examen?.maxilar_inferior || 'normal',
                observaciones: examen?.observaciones || '',
                placa_bacteriana: periodontal?.placa_bacteriana || 'no',
                calculos_dentales: periodontal?.calculos_dentales || 'no',
                bolsa_periodontal: periodontal?.bolsa_periodontal || 'no',
                movilidad_dental: periodontal?.movilidad_dental || 'no',
                tipo_atencion: parteDiario?.tipo_atencion || 'primaria',
                tipo_atencion2: parteDiario?.tipo_atencion2 || 'curativo',
                detalle_diagnostico: parteDiario?.detalle_diagnostico || '',
                procedimiento: parteDiario?.procedimiento || 'Profilaxis'
            };

            const savedDraft = loadDraft();
            if (savedDraft?.formData) {
                setFichaForm({ ...initialFormState, ...savedDraft.formData });
                showSystemToast("Borrador odontológico no guardado recuperado automáticamente.");
            } else {
                setFichaForm(initialFormState);
            }
        } catch (err) {
            console.error("Error al cargar la ficha odontológica:", err);
            showSystemToast("Error al cargar la ficha del paciente.");
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

    const handleSaveFichaSection = async (sectionKey, tipoAtencionOverride = null) => {
        if (!selectedPatient) return false;
        setFichaSaving(true);
        const patientId = selectedPatient?.id_usuario || selectedPatient?.id;
        const today = getLocalDateString();

        try {
            if (sectionKey === 'motivo') {
                const payload = {
                    id_usuario_paciente: patientId,
                    detalle_motivo: fichaForm.detalle_motivo,
                    ultima_visita_fecha: fichaForm.ultima_visita_fecha,
                    algun_tratamiento: fichaForm.algun_tratamiento,
                    detalle_tratamiento: fichaForm.detalle_tratamiento,
                    algun_medicamento: fichaForm.algun_medicamento,
                    detalle_medicamento: fichaForm.detalle_medicamento
                };
                if (fichaRawData.motivo) {
                    await api.put(`/odontologia/motivo-consulta/${fichaRawData.motivo.id}`, payload);
                } else {
                    const res = await api.post('/odontologia/motivo-consulta', payload);
                    setFichaRawData(prev => ({ ...prev, motivo: res.data.data }));
                }
            }

            if (sectionKey === 'examen_clinico') {
                const payload = {
                    id_usuario_paciente: patientId,
                    piel: fichaForm.piel,
                    labios: fichaForm.labios,
                    carrillos: fichaForm.carrillos,
                    paladar: fichaForm.paladar,
                    piso_de_la_boca: fichaForm.piso_de_la_boca,
                    lengua: fichaForm.lengua,
                    glándulas_salivales: fichaForm.glándulas_salivales,
                    ganglios: fichaForm.ganglios,
                    tejido_muscular: fichaForm.tejido_muscular,
                    atm: fichaForm.atm,
                    maxilar_superior: fichaForm.maxilar_superior,
                    maxilar_inferior: fichaForm.maxilar_inferior,
                    observaciones: fichaForm.observaciones
                };
                if (fichaRawData.examen) {
                    await api.put(`/odontologia/examen/${fichaRawData.examen.id}`, payload);
                } else {
                    const res = await api.post('/odontologia/examen', payload);
                    setFichaRawData(prev => ({ ...prev, examen: res.data.data }));
                }
            }

            if (sectionKey === 'periodontal') {
                const payload = {
                    id_usuario_paciente: patientId,
                    placa_bacteriana: fichaForm.placa_bacteriana,
                    calculos_dentales: fichaForm.calculos_dentales,
                    bolsa_periodontal: fichaForm.bolsa_periodontal,
                    movilidad_dental: fichaForm.movilidad_dental
                };
                if (fichaRawData.periodontal) {
                    await api.put(`/odontologia/enfermedad-periodontal/${fichaRawData.periodontal.id}`, payload);
                } else {
                    const res = await api.post('/odontologia/enfermedad-periodontal', payload);
                    setFichaRawData(prev => ({ ...prev, periodontal: res.data.data }));
                }
            }

            if (sectionKey === 'diagnostico') {
                const dailyPayload = {
                    id_usuario_paciente: patientId,
                    fecha: today,
                    tipo_atencion: tipoAtencionOverride || fichaForm.tipo_atencion || 'primaria',
                    tipo_atencion2: fichaForm.tipo_atencion2 || 'curativo',
                    detalle_diagnostico: fichaForm.detalle_diagnostico || 'Evaluación Odontológica',
                    procedimiento: fichaForm.procedimiento || 'Profilaxis'
                };
                if (fichaRawData.parte_diario) {
                    await api.put(`/odontologia/parte-diario-odontologia/${fichaRawData.parte_diario.id}`, dailyPayload);
                } else {
                    const res = await api.post('/odontologia/parte-diario-odontologia', dailyPayload);
                    setFichaRawData(prev => ({ ...prev, parte_diario: res.data.data }));
                }
            }

            clearDraft();
            showSystemToast("Sección guardada correctamente.");
            setSaveFeedback({
                show: true,
                success: true,
                title: "¡Guardado exitoso!",
                message: "La sección de la ficha clínica ha sido registrada en el sistema."
            });
            return true;
        } catch (err) {
            console.error("Error al guardar la sección clínica:", err);
            const backendMsg = err.response?.data?.message ||
                (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' | ') : null);
            showSystemToast(backendMsg || "Error al guardar la información clínica.");
            setSaveFeedback({
                show: true,
                success: false,
                title: "Error al guardar",
                message: backendMsg || "Ocurrió un error al procesar la solicitud."
            });
            return false;
        } finally {
            setFichaSaving(false);
        }
    };

    // ==========================================
    // CONTROLADORES DE API - ODONTOGRAMA RELACIONAL
    // ==========================================
    const fetchEstados = async () => {
        try {
            const res = await api.get('/odontologia/odontograma-estados');
            let data = res.data.data || [];
            if (data.length === 0) {
                // Si la BD no tiene estados de odontograma, los sembramos dinámicamente
                const defaultStates = [
                    { nombre: 'Caries', color: '#ef4444', svg_icon: 'caries', descripcion: 'Caries dental activa' },
                    { nombre: 'Obturado', color: '#3b82f6', svg_icon: 'obturado', descripcion: 'Tratado con calza/resina' },
                    { nombre: 'Corona', color: '#eab308', svg_icon: 'corona', descripcion: 'Corona o prótesis dental' },
                    { nombre: 'Ausente', color: '#475569', svg_icon: 'ausente', descripcion: 'Pieza extraída o ausente' }
                ];
                const seeded = [];
                for (const state of defaultStates) {
                    const postRes = await api.post('/odontologia/odontograma-estados', state);
                    seeded.push(postRes.data.data);
                }
                data = seeded;
            }
            setOdontogramaEstados(data);
            if (data.length > 0) {
                // Asignar por defecto el primer estado que no sea "Ausente" o el primero disponible
                setSelectedStateTool(data[0].id);
            }
        } catch (err) {
            console.error("Error al cargar estados del odontograma:", err);
        }
    };

    const fetchDentalCatalog = async () => {
        try {
            const res = await api.get('/odontologia/odontograma-catalogo');
            setDentalCatalog(res.data.data || []);
        } catch (err) {
            console.error("Error al cargar catálogo de piezas dentales:", err);
        }
    };

    const fetchOdontograma = async (patientId) => {
        setOdontogramaLoading(true);
        try {
            // Cargar o inicializar el odontograma para el paciente
            const response = await api.get(`/odontologia/odontograma-paciente/${patientId}`)
                .catch(async (err) => {
                    if (err.response && err.response.status === 404) {
                        const createRes = await api.post('/odontologia/odontograma-paciente', {
                            id_usuario_paciente: patientId
                        });
                        return createRes;
                    }
                    throw err;
                });

            const odData = response?.data?.data || null;
            setPatientOdontograma(odData);

            if (odData) {
                const mapState = initialTeethState();

                if (odData.asignaciones && odData.asignaciones.length > 0) {
                    odData.asignaciones.forEach(assign => {
                        const universalNum = assign.pieza ? assign.pieza.numero_pieza_dental : null;
                        if (!universalNum) return;

                        const fdiNum = Object.keys(fdiToUniversal).find(
                            key => String(fdiToUniversal[key]) === String(universalNum)
                        );
                        if (!fdiNum) return;

                        if (assign.id_numero_carilla === null) {
                            // Asignación de pieza completa (ej. Ausente)
                            const stateObj = odontogramaEstados.find(e => e.id === assign.id_estado);
                            if (stateObj && stateObj.nombre.toLowerCase() === 'ausente') {
                                mapState[fdiNum].ausente = true;
                            }
                        } else {
                            // Asignación de carilla
                            const carillaName = assign.carilla ? assign.carilla.numero_carilla.toLowerCase() : '';
                            const face = getSvgFaceName(fdiNum, carillaName);
                            if (face && mapState[fdiNum]) {
                                mapState[fdiNum][face] = assign.id_estado;
                            }
                        }
                    });
                }
                setOdontogramaState(mapState);
            } else {
                setOdontogramaState(initialTeethState());
            }
        } catch (err) {
            console.error("Error al cargar odontograma del paciente:", err);
            showSystemToast("Error al cargar el odontograma.");
        } finally {
            setOdontogramaLoading(false);
        }
    };

    const handleToothClick = (toothNum, face) => {
        const selectedState = odontogramaEstados.find(e => e.id === selectedStateTool);
        const selectedStateName = selectedState ? selectedState.nombre.toLowerCase() : '';

        setOdontogramaState(prev => {
            const tooth = { ...prev[toothNum] };
            if (selectedStateName === 'ausente') {
                tooth.ausente = !tooth.ausente;
                if (tooth.ausente) {
                    // Si se marca ausente, limpiar las caras
                    tooth.top = 'sano';
                    tooth.bottom = 'sano';
                    tooth.left = 'sano';
                    tooth.right = 'sano';
                    tooth.center = 'sano';
                }
            } else {
                const currentVal = tooth[face];
                // Toggle del estado si vuelve a presionar el mismo
                if (String(currentVal) === String(selectedStateTool)) {
                    tooth[face] = 'sano';
                } else {
                    tooth[face] = selectedStateTool;
                }
                tooth.ausente = false;
            }
            return {
                ...prev,
                [toothNum]: tooth
            };
        });
    };

    const handleSaveOdontograma = async () => {
        if (!selectedPatient || !patientOdontograma) return;
        setOdontogramaSaving(true);

        try {
            const dbAssigns = patientOdontograma.asignaciones || [];
            const postPromises = [];

            for (const fdiNumStr of Object.keys(odontogramaState)) {
                const fdiNum = parseInt(fdiNumStr);
                const toothVal = odontogramaState[fdiNum];
                const universalNum = fdiToUniversal[fdiNum];

                const piece = dentalCatalog.find(p => String(p.numero_pieza_dental) === String(universalNum));
                if (!piece) continue;

                const pieceId = piece.id;

                if (toothVal.ausente) {
                    const existingFull = dbAssigns.find(
                        a => a.id_numero_pieza === pieceId && a.id_numero_carilla === null
                    );

                    const ausenteState = odontogramaEstados.find(e => e.nombre.toLowerCase() === 'ausente');
                    if (!ausenteState) continue;

                    // Limpiar asignaciones por carilla en esta pieza antes de guardar ausente
                    const faceAssigns = dbAssigns.filter(
                        a => a.id_numero_pieza === pieceId && a.id_numero_carilla !== null
                    );
                    for (const fa of faceAssigns) {
                        postPromises.push(api.delete(`/odontologia/odontograma-asignaciones/${fa.id}`));
                    }

                    if (existingFull) {
                        if (existingFull.id_estado !== ausenteState.id) {
                            postPromises.push(
                                api.put(`/odontologia/odontograma-asignaciones/${existingFull.id}`, {
                                    id_estado: ausenteState.id,
                                    fecha: getLocalDateString()
                                })
                            );
                        }
                    } else {
                        postPromises.push(
                            api.post('/odontologia/odontograma-asignaciones', {
                                id_odontograma_paciente: patientOdontograma.id,
                                id_numero_pieza: pieceId,
                                id_numero_carilla: null,
                                id_estado: ausenteState.id,
                                fecha: getLocalDateString()
                            })
                        );
                    }
                } else {
                    // Si ya no es ausente, eliminar la asignación de pieza completa
                    const existingFull = dbAssigns.find(
                        a => a.id_numero_pieza === pieceId && a.id_numero_carilla === null
                    );
                    if (existingFull) {
                        postPromises.push(api.delete(`/odontologia/odontograma-asignaciones/${existingFull.id}`));
                    }

                    // Chequear caras
                    const faces = ['top', 'bottom', 'left', 'right', 'center'];

                    for (const face of faces) {
                        const faceState = toothVal[face];
                        const carillaName = getCarillaDbName(fdiNum, face);

                        const carilla = piece.carillas?.find(
                            c => c.numero_carilla.toLowerCase() === carillaName.toLowerCase()
                        );
                        if (!carilla) continue;

                        const carillaId = carilla.id;
                        const existingCarillaAssign = dbAssigns.find(
                            a => a.id_numero_pieza === pieceId && a.id_numero_carilla === carillaId
                        );

                        if (faceState !== 'sano' && faceState !== undefined) {
                            const stateId = parseInt(faceState);

                            if (existingCarillaAssign) {
                                if (existingCarillaAssign.id_estado !== stateId) {
                                    postPromises.push(
                                        api.put(`/odontologia/odontograma-asignaciones/${existingCarillaAssign.id}`, {
                                            id_estado: stateId,
                                            fecha: getLocalDateString()
                                        })
                                    );
                                }
                            } else {
                                postPromises.push(
                                    api.post('/odontologia/odontograma-asignaciones', {
                                        id_odontograma_paciente: patientOdontograma.id,
                                        id_numero_pieza: pieceId,
                                        id_numero_carilla: carillaId,
                                        id_estado: stateId,
                                        fecha: getLocalDateString()
                                    })
                                );
                            }
                        } else if (existingCarillaAssign) {
                            postPromises.push(api.delete(`/odontologia/odontograma-asignaciones/${existingCarillaAssign.id}`));
                        }
                    }
                }
            }

            await Promise.all(postPromises);
            showSystemToast("Odontograma guardado correctamente.");
            await fetchOdontograma(selectedPatient.id_usuario);
            return true;
        } catch (err) {
            console.error(err);
            showSystemToast("Error al guardar el odontograma.");
            return false;
        } finally {
            setOdontogramaSaving(false);
        }
    };

    const fetchParteDiario = async () => {
        setParteDiarioLoading(true);
        try {
            const res = await api.get('/odontologia/parte-diario-odontologia');
            const list = res.data.data || [];
            const filtered = list.filter(item => {
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

    const handlePrintParteDiario = async () => {
        if (parteDiarioList.length === 0) {
            showSystemToast('No hay atenciones en esta fecha para generar el reporte.');
            return;
        }

        let detailedList = [];
        try {
            showSystemToast('Cargando datos de pacientes...');
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
        let sumPrimera = 0;
        let sumSubsecuente = 0;
        let sumEmision = 0;
        let sumValidacion = 0;

        let sumProfilaxis = 0;
        let sumFluor = 0;
        let sumDestar = 0;
        let sumRestProv = 0;
        let sumRestRes = 0;
        let sumDesgaste = 0;
        let sumExo = 0;
        let sumReceta = 0;
        let sumRx = 0;

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
            if (item.paciente?.discapacidades && item.paciente.discapacidades.length > 0) {
                const d = item.paciente.discapacidades[0];
                disability = `${d.nombre || 'Sí'} (${d.porcentaje || 0}%)`;
            } else if (item.paciente?.autopercepcion?.discapacidad) {
                disability = item.paciente.autopercepcion.discapacidad;
            }

            const genderName = (item.paciente?.autopercepcion?.genero?.nombre || '').toLowerCase();
            let isMale = false;
            let isFemale = false;
            let isLgbti = false;

            if (genderName.includes('masc') || genderName.includes('homb')) {
                isMale = true;
                sumHombre++;
            } else if (genderName.includes('fem') || genderName.includes('muj')) {
                isFemale = true;
                sumMujer++;
            } else if (genderName.includes('lgbt') || genderName.includes('otro') || genderName.includes('diver')) {
                isLgbti = true;
                sumLgbti++;
            }

            const userTypeVal = item.paciente?.id_tipo_usuario;
            const estudio = item.paciente?.estudio_carrera || item.paciente?.estudioCarrera;
            let isEstudiante = false;
            let isDocente = false;
            let isAdministrativo = false;

            if (estudio || userTypeVal === 1) {
                isEstudiante = true;
                sumEstudiante++;
            } else if (userTypeVal === 2) {
                isDocente = true;
                sumDocente++;
            } else if (userTypeVal === 3) {
                isAdministrativo = true;
                sumAdministrativo++;
            }

            // Tipo de Atención
            const ta = (item.tipo_atencion || '').toLowerCase();
            const isPrimera = ta === 'primaria';
            const isSubsecuente = ta === 'secundaria';
            const isEmision = ta === 'certificadomedico';
            const isValidacion = ta === 'validacion';

            if (isPrimera) sumPrimera++;
            if (isSubsecuente) sumSubsecuente++;
            if (isEmision) sumEmision++;
            if (isValidacion) sumValidacion++;

            // Procedimiento
            const proc = (item.procedimiento || '').toLowerCase();
            const isProfilaxis = proc.includes('profilaxis');
            const isFluoriz = proc.includes('fluor') || proc.includes('fluoriz');
            const isDestar = proc.includes('destartraje');
            const isRestProv = proc.includes('provisional');
            const isRestRes = proc.includes('resina') || proc.includes('calza');
            const isDesgaste = proc.includes('desgaste');
            const isExo = proc.includes('exodoncia') || proc.includes('extraccion');
            const isReceta = proc.includes('receta');
            const isRx = proc.includes('rx') || proc.includes('rayos');

            if (isProfilaxis) sumProfilaxis++;
            if (isFluoriz) sumFluor++;
            if (isDestar) sumDestar++;
            if (isRestProv) sumRestProv++;
            if (isRestRes) sumRestRes++;
            if (isDesgaste) sumDesgaste++;
            if (isExo) sumExo++;
            if (isReceta) sumReceta++;
            if (isRx) sumRx++;

            return `
                <tr>
                    <td>${idx + 1}</td>
                    <td class="left-align font-bold">${fullName}</td>
                    <td>${cedula}</td>
                    <td>${disability || '—'}</td>
                    <td>${age}</td>
                    <td>${isMale ? 'X' : ''}</td>
                    <td>${isFemale ? 'X' : ''}</td>
                    <td>${isLgbti ? 'X' : ''}</td>
                    <td>${isAdministrativo ? 'X' : ''}</td>
                    <td>${isDocente ? 'X' : ''}</td>
                    <td>${isEstudiante ? 'X' : ''}</td>
                    <td>${isPrimera ? 'X' : ''}</td>
                    <td>${isSubsecuente ? 'X' : ''}</td>
                    <td>${isEmision ? 'X' : ''}</td>
                    <td>${isValidacion ? 'X' : ''}</td>
                    <td class="left-align">${item.detalle_diagnostico}</td>
                    <td>${isProfilaxis ? 'X' : ''}</td>
                    <td>${isFluoriz ? 'X' : ''}</td>
                    <td>${isDestar ? 'X' : ''}</td>
                    <td>${isRestProv ? 'X' : ''}</td>
                    <td>${isRestRes ? 'X' : ''}</td>
                    <td>${isDesgaste ? 'X' : ''}</td>
                    <td>${isExo ? 'X' : ''}</td>
                    <td>${isReceta ? 'X' : ''}</td>
                    <td>${isRx ? 'X' : ''}</td>
                </tr>
            `;
        }).join('');

        const emptyRowsCount = Math.max(0, 16 - detailedList.length);
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
                <title>Parte Diario de Odontología - ${formattedDate}</title>
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
                    .header-logo {
                        width: 100px;
                        font-weight: 800;
                        font-size: 14px;
                        color: #002040;
                    }
                    .header-title {
                        text-align: center;
                        flex-grow: 1;
                    }
                    .header-title h1 {
                        font-size: 14px;
                        margin: 0 0 2px 0;
                        text-transform: uppercase;
                        font-weight: bold;
                        color: #000;
                    }
                    .header-title h2 {
                        font-size: 12px;
                        margin: 0 0 2px 0;
                        font-weight: bold;
                        color: #333;
                        text-transform: uppercase;
                    }
                    .header-title h3 {
                        font-size: 11px;
                        margin: 0;
                        font-weight: 500;
                        color: #000;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .right-header-box {
                        border: 1px dashed #000;
                        padding: 6px 12px;
                        font-weight: 850;
                        font-size: 11px;
                        text-align: center;
                        background-color: #f8fafc;
                        min-width: 100px;
                    }
                    .meta-info {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                    }
                    .date-box {
                        border: 1px solid #000;
                        padding: 5px 15px;
                        font-weight: bold;
                        font-size: 9px;
                        background-color: #ffffff;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                    }
                    th, td {
                        border: 1px solid #000;
                        padding: 3px 2px;
                        text-align: center;
                        vertical-align: middle;
                    }
                    th {
                        font-weight: bold;
                        font-size: 7.5px;
                    }
                    /* Colores de cabeceras según el formato físico */
                    .th-num { width: 22px; background-color: #fbcfe8 !important; }
                    .th-nombres { width: 140px; background-color: #fbcfe8 !important; }
                    .th-cedula { width: 65px; background-color: #dbeafe !important; }
                    .th-discapacidad { width: 75px; background-color: #fef08a !important; }
                    .th-edad { width: 22px; background-color: #ffedd5 !important; }
                    .th-genero { background-color: #fef9c3 !important; }
                    .th-comunidad { background-color: #dbeafe !important; }
                    .th-tipoatencion { background-color: #e9d5ff !important; }
                    .th-diagnostico { width: 195px; background-color: #dcfce7 !important; }
                    .th-procedimiento { background-color: #ffedd5 !important; }
                    
                    .sub-header th {
                        background-color: #ffffff !important;
                        font-size: 7px;
                        font-weight: bold;
                    }
                    .vertical-th {
                        writing-mode: vertical-rl;
                        transform: rotate(180deg);
                        white-space: nowrap;
                        text-align: center;
                        font-size: 6.5px;
                        font-weight: 700;
                        padding: 6px 2px;
                        height: 75px;
                        width: 15px;
                    }
                    .left-align {
                        text-align: left;
                        padding-left: 4px;
                    }
                    .font-bold {
                        font-weight: bold;
                    }
                    .bg-totals {
                        background-color: #f3f4f6 !important;
                        font-weight: bold;
                    }
                    .signatures-container {
                        margin-top: 20px;
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
                            <div class="header-logo">
                                UEB-BIENESTAR
                            </div>
                            <div class="header-title">
                                <h1>Universidad Estatal de Bolívar</h1>
                                <h2>Bienestar Universitario</h2>
                                <h3>Parte Diario - Campus La Matriz</h3>
                            </div>
                            <div class="right-header-box">
                                ODONTOLOGÍA
                            </div>
                        </header>

                        <div class="meta-info">
                            <div class="date-box">
                                FECHA: <strong>${formattedDate}</strong>
                            </div>
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
                                    <th colspan="3" class="th-comunidad">COMUNIDAD UNIVERSITARIA</th>
                                    <th colspan="4" class="th-tipoatencion">TIPO ATENCIÓN</th>
                                    <th rowspan="2" class="th-diagnostico">DIAGNÓSTICO</th>
                                    <th colspan="9" class="th-procedimiento">PROCEDIMIENTO</th>
                                </tr>
                                <tr class="sub-header">
                                    <th style="font-size: 6.5px;">TIPO DE DISCAPACIDAD</th>
                                    <th style="width: 15px;">HOMBRE</th>
                                    <th style="width: 15px;">MUJER</th>
                                    <th style="width: 15px;">LGBTI</th>
                                    <th style="font-size: 6px;">ADMINISTRATIVO</th>
                                    <th style="font-size: 6px;">DOCENTE</th>
                                    <th style="font-size: 6px;">CARRERA</th>
                                    <th class="vertical-th">PRIMERA</th>
                                    <th class="vertical-th">SUBSECUENTE</th>
                                    <th class="vertical-th" style="font-size: 5.5px;">EMISIÓN CERTIFICADO</th>
                                    <th class="vertical-th" style="font-size: 5.5px;">VALIDACIÓN CERT.</th>
                                    <th class="vertical-th">PROFILAXIS</th>
                                    <th class="vertical-th">FLUORIZACIÓN</th>
                                    <th class="vertical-th">DESTARTRAJE</th>
                                    <th class="vertical-th">REST. PROVISIONAL</th>
                                    <th class="vertical-th">REST. CON RESINA</th>
                                    <th class="vertical-th">DESGASTE</th>
                                    <th class="vertical-th">EXODONCIAS</th>
                                    <th class="vertical-th">RECETA</th>
                                    <th class="vertical-th">ORDEN DE RX</th>
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
                                    <td>${sumAdministrativo}</td>
                                    <td>${sumDocente}</td>
                                    <td>${sumEstudiante}</td>
                                    <td>${sumPrimera}</td>
                                    <td>${sumSubsecuente}</td>
                                    <td>${sumEmision}</td>
                                    <td>${sumValidacion}</td>
                                    <td></td>
                                    <td>${sumProfilaxis}</td>
                                    <td>${sumFluor}</td>
                                    <td>${sumDestar}</td>
                                    <td>${sumRestProv}</td>
                                    <td>${sumRestRes}</td>
                                    <td>${sumDesgaste}</td>
                                    <td>${sumExo}</td>
                                    <td>${sumReceta}</td>
                                    <td>${sumRx}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="signatures-container">
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <strong>Odontólogo/a: ${user?.name || 'Profesional Responsable'}</strong><br>
                            <span>Responsable de Bienestar Universitario</span>
                        </div>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 300);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
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
                        ? `/odontologia/historial-evolucion/${record.id}`
                        : `/odontologia/parte-diario-odontologia/${record.id}`;

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
            const diagnosis = isEvol ? (record.detalle_evolucion || 'Evolución Odontológica') : (record.detalle_diagnostico || 'Consulta Dental');
            const procedure = isEvol ? 'Tratamiento y Seguimiento' : (record.procedimiento || 'Evaluación Odontológica');

            const htmlContent = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Certificado Odontológico</title>
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

                        <div class="certificate-title">CERTIFICADO ODONTOLÓGICO</div>

                        <div class="certificate-body">
                            Por medio de la presente, se hace constar y se certifica que el/la estudiante 
                            <span class="bold-text">${selectedPatient.nombre_completo}</span>, con cédula de identidad número 
                            <span class="bold-text">${selectedPatient.cedula || selectedPatient.numero_cedula || '—'}</span>, asistió 
                            a la consulta del área de <span class="bold-text">Odontología</span> el día 
                            <span class="bold-text">${record.fecha || (record.created_at ? record.created_at.slice(0, 10) : '')}</span>.
                            <br><br>
                            El paciente recibió atención y tratamiento dental clínico, registrando en su expediente el diagnóstico 
                            de <span class="bold-text">"${diagnosis}"</span> y realizándose el procedimiento de <span class="bold-text">"${procedure}"</span>.
                            <br><br>
                            Se expide el presente documento a petición de la parte interesada para los fines legales, académicos o personales pertinentes.
                        </div>

                        <div class="footer-date">
                            Dado y firmado en la ciudad de Guaranda, a los ${dayNum} días del mes de ${monthName} del año ${year}.
                        </div>

                        <div class="signatures-container">
                            <div class="signature-box">
                                <div class="signature-line"></div>
                                <strong style="font-size: 13px; color: #0f172a;">${user?.name || 'Odontólogo/a Responsable'}</strong><br>
                                <span class="credentials">Responsable del Área de Odontología</span><br>
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

    useEffect(() => {
        if (activeTab === 'diario') {
            fetchParteDiario();
        }
    }, [activeTab, parteDiarioDate]);

    const getParteKPIs = () => {
        const total = parteDiarioList.length;
        const primarias = parteDiarioList.filter(item => item.tipo_atencion === 'primaria').length;
        const secundarias = parteDiarioList.filter(item => item.tipo_atencion === 'secundaria').length;
        const certificados = parteDiarioList.filter(item => item.tipo_atencion === 'certificadomedico').length;
        return { total, primarias, secundarias, certificados };
    };

    // ==========================================
    // CONTROLADORES DE API - INSUMOS MÉDICOS
    // ==========================================
    const fetchCatalogoInsumos = async () => {
        setInsumosLoading(true);
        try {
            const [catRes, pacRes] = await Promise.all([
                api.get('/odontologia/catalogo-insumos').catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/insumos-paciente').catch(() => ({ data: { data: [] } }))
            ]);
            setInsumosCatalogo(catRes.data.data || []);
            setInsumosPacienteList(pacRes.data.data || []);
        } catch (err) {
            console.error('Error al cargar insumos:', err);
        } finally {
            setInsumosLoading(false);
        }
    };

    const fetchAllParteDiarioForReport = async () => {
        setReportLoading(true);
        try {
            const res = await api.get('/odontologia/parte-diario-odontologia');
            setAllParteDiarioForDiagnosis(res.data.data || []);
        } catch (err) {
            console.error('Error al cargar diario para diagnóstico:', err);
        } finally {
            setReportLoading(false);
        }
    };

    const handleOpenReport = () => {
        setIsReportModalOpen(true);
        fetchAllParteDiarioForReport();
    };

    const compileInsumosReportHtmlString = () => {
        // Filtramos consumos para el mes/año seleccionado de forma segura mediante slice
        const filteredConsumos = insumosPacienteList.filter(item => {
            const rawDate = item.fecha || item.created_at || '';
            if (!rawDate) return false;
            const dateStr = String(rawDate).slice(0, 7); // "YYYY-MM"
            const targetMonthStr = `${reportYear}-${String(reportMonth).padStart(2, '0')}`;
            return dateStr === targetMonthStr;
        });

        // Agrupamos por paciente
        const getParsedQty = (qtyStr) => {
            const match = (qtyStr || '').trim().match(/^\d+(\.\d+)?/);
            return match ? parseFloat(match[0]) || 1 : 1;
        };

        const getPatientDiagnosis = (patientId) => {
            const patientParts = allParteDiarioForDiagnosis.filter(p => parseInt(p.id_usuario_paciente) === parseInt(patientId));
            if (patientParts.length > 0) {
                const sorted = [...patientParts].sort((a, b) => {
                    const dateA = a.fecha || '';
                    const dateB = b.fecha || '';
                    return dateB.localeCompare(dateA);
                });
                return sorted[0].detalle_diagnostico || sorted[0].procedimiento || 'Consulta General';
            }
            return 'Consulta General';
        };

        const groupedData = {};
        filteredConsumos.forEach(item => {
            const pid = item.id_usuario_paciente;
            if (!groupedData[pid]) {
                groupedData[pid] = {
                    paciente: item.paciente,
                    consumos: {},
                    diagnostico: getPatientDiagnosis(pid)
                };
            }
            const insumoId = item.id_insumo;
            const qty = getParsedQty(item.cantidad_gastada);
            groupedData[pid].consumos[insumoId] = (groupedData[pid].consumos[insumoId] || 0) + qty;
        });

        const rows = Object.values(groupedData);

        const totalPorciones = {};
        insumosCatalogo.forEach(insumo => {
            totalPorciones[insumo.id] = rows.reduce((acc, row) => acc + (row.consumos[insumo.id] || 0), 0);
        });

        const monthsText = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const selectedMonthText = monthsText[reportMonth - 1];

        // Generar HTML de las filas
        let tableRowsHtml = '';
        if (rows.length === 0) {
            tableRowsHtml = `
                <tr>
                    <td colspan="${insumosCatalogo.length + 3}" style="border: 1px solid #000; padding: 15px; text-align: center; color: #666; font-size: 11px;">
                        No se registraron consumos de insumos en el periodo seleccionado.
                    </td>
                </tr>
            `;
        } else {
            tableRowsHtml = rows.map((row, idx) => {
                const pIdent = row.paciente?.datos_identificacion || row.paciente?.datosIdentificacion;
                const pacienteNombre = pIdent
                    ? `${pIdent.primer_nombre} ${pIdent.segundo_nombre || ''} ${pIdent.apellido_paterno} ${pIdent.apellido_materno || ''}`.replace(/\s+/g, ' ').trim()
                    : row.paciente?.name || `Paciente ID: ${row.paciente?.id || '—'}`;

                const supplyCells = insumosCatalogo.map(insumo => {
                    const val = row.consumos[insumo.id];
                    return `<td style="border: 1px solid #000; padding: 5px; text-align: center; font-weight: bold; background: ${val ? '#f9fafb' : 'transparent'};">${val ? val : ''}</td>`;
                }).join('');

                return `
                    <tr>
                        <td style="border: 1px solid #000; padding: 5px; text-align: center;">${idx + 1}</td>
                        <td style="border: 1px solid #000; padding: 5px; font-weight: 500;">${pacienteNombre.toUpperCase()}</td>
                        ${supplyCells}
                        <td style="border: 1px solid #000; padding: 5px;">${row.diagnostico}</td>
                    </tr>
                `;
            }).join('');

            // Agregar fila de total porciones
            const totalPorcionesCells = insumosCatalogo.map(insumo => {
                return `<td style="border: 1px solid #000; padding: 5px; text-align: center; color: #1e3a8a;">${totalPorciones[insumo.id] || '0'}</td>`;
            }).join('');

            tableRowsHtml += `
                <tr style="background: #f1f5f9; font-weight: bold;">
                    <td style="border: 1px solid #000; padding: 5px; text-align: center;"></td>
                    <td style="border: 1px solid #000; padding: 5px; text-transform: uppercase;">Total Porciones Unidades</td>
                    ${totalPorcionesCells}
                    <td style="border: 1px solid #000; padding: 5px;"></td>
                </tr>
            `;

            // Agregar fila de total frascos
            const totalFrascosCells = insumosCatalogo.map(insumo => {
                return `<td style="border: 1px solid #000; padding: 5px; text-align: center; color: #b71a34;">${totalPorciones[insumo.id] > 0 ? 1 : '0'}</td>`;
            }).join('');

            tableRowsHtml += `
                <tr style="background: #f1f5f9; font-weight: bold;">
                    <td style="border: 1px solid #000; padding: 5px; text-align: center;"></td>
                    <td style="border: 1px solid #000; padding: 5px; text-transform: uppercase;">Total Frascos Utilizados</td>
                    ${totalFrascosCells}
                    <td style="border: 1px solid #000; padding: 5px;"></td>
                </tr>
            `;
        }

        // Cabeceras de insumos (verticales)
        const insumoHeaders = insumosCatalogo.map(insumo => {
            return `<th style="border: 1px solid #000; padding: 4px 2px; width: 30px; text-align: center; vertical-align: bottom; height: 110px;">
                <div style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; font-size: 8px; font-weight: bold; display: inline-block; width: 100%; text-align: left;">
                    ${insumo.nombre.toUpperCase()}
                </div>
            </th>`;
        }).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte de Insumos - ${selectedMonthText} ${reportYear}</title>
                <style>
                    @page { size: landscape; margin: 10mm; }
                    body { font-family: Arial, sans-serif; font-size: 10px; color: #000; margin: 0; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; font-size: 9px; border: 1.5px solid #000; }
                    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
                    <h2 style="margin: 0 0 4px 0; font-size: 15px; font-weight: bold; text-transform: uppercase;">Universidad Estatal de Bolívar</h2>
                    <h3 style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #475569;">Bienestar Universitario</h3>
                    <h3 style="margin: 0 0 4px 0; font-size: 11px; font-weight: bold; text-transform: uppercase;">Consumo Diario de Materiales Odontológicos Unidad Operativa</h3>
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 15px;">
                    <div>
                        <div><strong>UNIDAD:</strong> BIENESTAR UNIVERSITARIO</div>
                        <div><strong>ODONTÓLOGO/A:</strong> ${doctorNameText}</div>
                    </div>
                    <div style="text-align: right;">
                        <div><strong>MES/AÑO:</strong> ${selectedMonthText.toUpperCase()} ${reportYear}</div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="border: 1px solid #000; padding: 4px; text-align: center; width: 35px; font-weight: bold;">N. Pacientes</th>
                            <th style="border: 1px solid #000; padding: 4px; text-align: left; min-width: 130px; font-weight: bold;">Nombre de Usuario</th>
                            ${insumoHeaders}
                            <th style="border: 1px solid #000; padding: 4px; text-align: left; min-width: 150px; font-weight: bold;">Diagnóstico</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml}
                    </tbody>
                </table>
            </body>
            </html>
        `;
    };

    const handlePrintInsumosReport = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showSystemToast("El bloqueador de popups impidió abrir la ventana de impresión. Por favor, permítalos.");
            return;
        }
        printWindow.document.write(compileInsumosReportHtmlString());
        printWindow.document.close();
    };

    const careerToFaculty = (careerName) => {
        const norm = (careerName || '').toLowerCase().trim();
        if (norm.includes('enfermer') || norm.includes('riesgo') || norm.includes('psicol') || norm.includes('terap')) {
            return 'CIENCIAS DE LA SALUD';
        }
        if (norm.includes('crimin') || norm.includes('derech') || norm.includes('sociol')) {
            return 'JURISPRUDENCIA';
        }
        if (norm.includes('empresa') || norm.includes('comunic') || norm.includes('auditor') || norm.includes('contab') || norm.includes('talento') || norm.includes('marketing') || norm.includes('mercadot') || norm.includes('softw') || norm.includes('sistem') || norm.includes('informát') || norm.includes('computac') || norm.includes('turism')) {
            return 'CIENCIAS ADMINISTRATIVAS';
        }
        if (norm.includes('agroin') || norm.includes('agron') || norm.includes('veterin')) {
            return 'CIENCIAS AGROPECUARIAS';
        }
        if (norm.includes('básic') || norm.includes('inicial') || norm.includes('intercult') || norm.includes('biling') || norm.includes('fisico') || norm.includes('pedagog') || norm.includes('idioma') || norm.includes('educac') || norm.includes('infantil')) {
            return 'CIENCIAS DE LA EDUCACIÓN';
        }
        return 'OTRAS';
    };

    const getDiagnosisCategory = (diagText) => {
        const t = (diagText || '').toLowerCase();
        if (t.includes('esm')) return 'Caries de Esmalte';
        if (t.includes('dent') || t.includes('carie') || t.trim() === '') return 'Caries de Dentina';
        if (t.includes('cem')) return 'Caries de Cemento';
        if (t.includes('pulpi') && t.includes('rev')) return 'Pulpitis Reversible';
        if (t.includes('pulpi') && t.includes('irrev')) return 'Pulpitis Irreversible';
        if (t.includes('necr')) return 'Necrosis Pulpar';
        if (t.includes('absces') && t.includes('cró')) return 'Absceso Periapical Crónico';
        if (t.includes('absces') && (t.includes('agu') || t.includes('ag'))) return 'Absceso Periapical Agudo';
        if (t.includes('periodon') && t.includes('agu')) return 'Periodontitis Apical Agudo';
        if (t.includes('raíz') || t.includes('reten')) return 'Raíz Dental Retenida';
        if (t.includes('impact')) return 'Diente Impactado';
        if (t.includes('inclu')) return 'Diente Incluido';
        if (t.includes('calcul') || t.includes('cálcul') || t.includes('sarro')) return 'Calculo Dental';
        if (t.includes('retrac')) return 'Retracción Gingival';
        if (t.includes('gingiv') && t.includes('cró')) return 'Gingivitis Crónica';
        if (t.includes('gingiv') && t.includes('agu')) return 'Gingivitis Aguda';
        if (t.includes('periodontitis') && t.includes('cró')) return 'Periodontitis Crónica';
        if (t.includes('periodontitis')) return 'Periodontitis';
        if (t.includes('abras')) return 'Abrasión';
        if (t.includes('alveol')) return 'Alveolitis';
        if (t.includes('sensib') || t.includes('dolor')) return 'Sensibilidad Dental';
        return 'Caries de Dentina';
    };

    const fetchAndCompileGeneralReport = async (monthVal = genReportMonth, yearVal = genReportYear) => {
        setGenReportLoading(true);
        try {
            // 1. Obtener partes diarios
            const res = await api.get('/odontologia/parte-diario-odontologia');
            const list = res.data.data || [];

            // 2. Obtener catálogos de la base de datos (facultades y carreras)
            const catRes = await api.get('/user-profile/catalogos');
            const dbFacultades = catRes.data.facultades || [];
            const dbCarreras = catRes.data.carreras || [];

            // Filtrar partes diarios por el mes/año seleccionado de forma segura mediante slice
            const targetMonthStr = `${yearVal}-${String(monthVal).padStart(2, '0')}`;
            const filteredPartes = list.filter(item => {
                const rawDate = item.fecha || item.created_at;
                if (!rawDate) return false;
                const dateStr = String(rawDate).trim().slice(0, 7);
                return dateStr === targetMonthStr;
            });

            // Obtener perfiles de pacientes únicos involucrados en el mes
            const uniquePatientIds = [...new Set(filteredPartes.map(item => item.id_usuario_paciente))];

            // Fetch de perfiles concurrentes en paralelo
            const patientProfiles = await Promise.all(
                uniquePatientIds.map(async (pid) => {
                    try {
                        const res = await api.get(`/medicina-general/pacientes/${pid}/perfil`);
                        return { pid, profile: res.data.data };
                    } catch (e) {
                        console.error('Error al cargar perfil de paciente:', pid, e);
                        return { pid, profile: null };
                    }
                })
            );

            const profileMap = {};
            patientProfiles.forEach(item => {
                profileMap[item.pid] = item.profile;
            });

            // 3. Estructuras de Reporte (Tablas 1 y 2 por Facultad/Carrera)
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

            // Inicializar las estadísticas de todas las carreras en 0
            dbCarreras.forEach(c => {
                const parentFac = dbFacultades.find(f => f.id === c.id_facultad);
                const repFacName = getReportingFacultyName(parentFac?.nombre, c.nombre);
                if (statsByFacultyAndCareer[repFacName]) {
                    statsByFacultyAndCareer[repFacName][c.nombre] = {
                        hombres: 0, mujeres: 0, lgbti: 0, total: 0,
                        preventiva: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                        curativa: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
                    };
                }
            });

            // 4. Estructura de Consolidado (Tabla 3)
            const curativosDiagnoses = [
                'Caries de Esmalte', 'Caries de Dentina', 'Caries de Cemento',
                'Pulpitis Reversible', 'Pulpitis Irreversible', 'Necrosis Pulpar',
                'Absceso Periapical Crónico', 'Absceso Periapical Agudo', 'Periodontitis Apical Agudo',
                'Raíz Dental Retenida', 'Diente Impactado', 'Diente Incluido',
                'Calculo Dental', 'Retracción Gingival', 'Gingivitis Crónica',
                'Gingivitis Aguda', 'Periodontitis', 'Periodontitis Crónica',
                'Abrasión', 'Alveolitis', 'Sensibilidad Dental'
            ];

            const consolidadoStats = {
                preventivo: {
                    'Examen Odontológico': {
                        estudiantes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                        administrativos: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                        docentes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
                    }
                },
                curativo: {}
            };
            curativosDiagnoses.forEach(diag => {
                consolidadoStats.curativo[diag] = {
                    estudiantes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                    administrativos: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                    docentes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
                };
            });

            // 5. Estructura de Fichas Individuales por Carrera (Tabla 4)
            const careerIndividualStats = {};

            // 6. Estructuras de Procedimientos
            let procPreventivos = {
                'PROFILAXIS': {
                    estudiantes: { hombres: 0, mujeres: 0, lgbti: 0 },
                    administrativos: { hombres: 0, mujeres: 0, lgbti: 0 },
                    docentes: { hombres: 0, mujeres: 0, lgbti: 0 }
                },
                'FLUORIZACIÓN': {
                    estudiantes: { hombres: 0, mujeres: 0, lgbti: 0 },
                    administrativos: { hombres: 0, mujeres: 0, lgbti: 0 },
                    docentes: { hombres: 0, mujeres: 0, lgbti: 0 }
                }
            };

            const procMorbilidadList = [
                'DESTARTRAJE', 'RESTAURACIÓN PROVISIONAL', 'RESTAURACIÓN CON RESINA',
                'DESGASTE DE PAREDES', 'EXODONCIA', 'RECETAS', 'ORDEN DE RX', 'RETIRO DE PUNTOS'
            ];

            let procMorbilidad = {};
            procMorbilidadList.forEach(p => {
                procMorbilidad[p] = {
                    estudiantes: { hombres: 0, mujeres: 0, lgbti: 0 },
                    administrativos: { hombres: 0, mujeres: 0, lgbti: 0 },
                    docentes: { hombres: 0, mujeres: 0, lgbti: 0 }
                };
            });

            // Variables de totales acumulados
            let totalEstudiantes = 0;
            let totalAdministrativos = 0;
            let totalDocentes = 0;

            let genderCounts = {
                estudiantes: { hombres: 0, mujeres: 0, lgbti: 0 },
                administrativos: { hombres: 0, mujeres: 0, lgbti: 0 },
                docentes: { hombres: 0, mujeres: 0, lgbti: 0 }
            };

            // Procesar cada registro
            filteredPartes.forEach(item => {
                const profile = profileMap[item.id_usuario_paciente] || item.paciente;

                // Determinar el género
                const genderVal = (profile?.autopercepcion?.genero?.nombre || '').toLowerCase();
                let genderKey = 'mujeres'; // default fallback
                if (genderVal.includes('masc') || genderVal.includes('homb')) {
                    genderKey = 'hombres';
                } else if (genderVal.includes('fem') || genderVal.includes('muj')) {
                    genderKey = 'mujeres';
                } else if (genderVal.includes('lgbti') || genderVal.includes('diver') || genderVal !== '') {
                    genderKey = 'lgbti';
                }

                // Determinar el tipo de usuario (Estudiante, Docente, Administrativo)
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
                    // Fallback por rol o carrera
                    const roleName = (profile?.role || '').toLowerCase();
                    if (roleName.includes('estud')) {
                        userType = 'estudiantes';
                        totalEstudiantes++;
                    } else if (roleName.includes('docen') || roleName.includes('prof')) {
                        userType = 'docentes';
                        totalDocentes++;
                    } else if (roleName.includes('admin') || roleName.includes('trabaj')) {
                        userType = 'administrativos';
                        totalAdministrativos++;
                    } else {
                        if (profile?.estudioCarrera?.id_carrera) {
                            userType = 'estudiantes';
                            totalEstudiantes++;
                        } else {
                            userType = 'administrativos';
                            totalAdministrativos++;
                        }
                    }
                }

                genderCounts[userType][genderKey]++;

                // Mapear carrera y facultad para Estudiantes
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

                // Incrementar atenciones preventivas/curativas en los reportes correspondientes
                const isPreventivo = item.tipo_atencion2 === 'preventivo';

                if (userType === 'estudiantes' && canonCareerName && repFacName && statsByFacultyAndCareer[repFacName]?.[canonCareerName]) {
                    // Tabla 1 (Carrera general)
                    statsByFacultyAndCareer[repFacName][canonCareerName][genderKey]++;
                    statsByFacultyAndCareer[repFacName][canonCareerName].total++;

                    // Tabla 2 (Preventivo/Curativo por carrera)
                    if (isPreventivo) {
                        statsByFacultyAndCareer[repFacName][canonCareerName].preventiva[genderKey]++;
                        statsByFacultyAndCareer[repFacName][canonCareerName].preventiva.total++;
                    } else {
                        statsByFacultyAndCareer[repFacName][canonCareerName].curativa[genderKey]++;
                        statsByFacultyAndCareer[repFacName][canonCareerName].curativa.total++;
                    }

                    // Tabla 4: Fichas individuales por carrera
                    if (!careerIndividualStats[canonCareerName]) {
                        careerIndividualStats[canonCareerName] = {
                            preventivo: {
                                'Examen Odontológico': { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
                            },
                            curativo: {}
                        };
                        curativosDiagnoses.forEach(diag => {
                            careerIndividualStats[canonCareerName].curativo[diag] = { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
                        });
                    }

                    if (isPreventivo) {
                        careerIndividualStats[canonCareerName].preventivo['Examen Odontológico'][genderKey]++;
                        careerIndividualStats[canonCareerName].preventivo['Examen Odontológico'].total++;
                    } else {
                        const category = getDiagnosisCategory(item.detalle_diagnostico);
                        if (careerIndividualStats[canonCareerName].curativo[category]) {
                            careerIndividualStats[canonCareerName].curativo[category][genderKey]++;
                            careerIndividualStats[canonCareerName].curativo[category].total++;
                        }
                    }
                }

                // Tabla 3 (Consolidado)
                if (isPreventivo) {
                    consolidadoStats.preventivo['Examen Odontológico'][userType][genderKey]++;
                    consolidadoStats.preventivo['Examen Odontológico'][userType].total++;
                } else {
                    const category = getDiagnosisCategory(item.detalle_diagnostico);
                    if (consolidadoStats.curativo[category]) {
                        consolidadoStats.curativo[category][userType][genderKey]++;
                        consolidadoStats.curativo[category][userType].total++;
                    }
                }

                // Procedimientos
                const proc = (item.procedimiento || '').toLowerCase();
                const genKey = genderKey;
                const catKey = userType;

                if (proc.includes('profilaxis')) {
                    procPreventivos['PROFILAXIS'][catKey][genKey]++;
                } else if (proc.includes('fluor')) {
                    procPreventivos['FLUORIZACIÓN'][catKey][genKey]++;
                } else if (proc.includes('destartraje')) {
                    procMorbilidad['DESTARTRAJE'][catKey][genKey]++;
                } else if (proc.includes('provisional')) {
                    procMorbilidad['RESTAURACIÓN PROVISIONAL'][catKey][genKey]++;
                } else if (proc.includes('resina') || proc.includes('calza')) {
                    procMorbilidad['RESTAURACIÓN CON RESINA'][catKey][genKey]++;
                } else if (proc.includes('desgaste')) {
                    procMorbilidad['DESGASTE DE PAREDES'][catKey][genKey]++;
                } else if (proc.includes('exodoncia') || proc.includes('extraccion')) {
                    procMorbilidad['EXODONCIA'][catKey][genKey]++;
                } else if (proc.includes('receta')) {
                    procMorbilidad['RECETAS'][catKey][genKey]++;
                } else if (proc.includes('rx') || proc.includes('rayos')) {
                    procMorbilidad['ORDEN DE RX'][catKey][genKey]++;
                } else if (proc.includes('puntos')) {
                    procMorbilidad['RETIRO DE PUNTOS'][catKey][genKey]++;
                }
            });

            setGenReportData({
                totalEstudiantes,
                totalAdministrativos,
                totalDocentes,
                totalPacientes: filteredPartes.length,
                genderCounts,
                statsByFacultyAndCareer,
                consolidadoStats,
                careerIndividualStats,
                procPreventivos,
                procMorbilidad,
                reportingFaculties,
                curativosDiagnoses
            });

        } catch (err) {
            console.error('Error al generar reporte:', err);
            showSystemToast('Error al generar el reporte.');
        } finally {
            setGenReportLoading(false);
        }
    };

    const compileGeneralReportHtmlString = (data) => {
        if (!data) return '';

        const monthsText = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const selectedMonthText = monthsText[genReportMonth - 1];

        const doctorNameText = user?.name ? user.name.toUpperCase() : 'PROFESIONAL RESPONSABLE';
        const doctorEmail = user?.email || 'angarcia@ueb.edu.ec';
        const reportNo = `006-OD-${genReportYear}`;

        let totalEstCareersCount = 0;
        data.reportingFaculties.forEach(f => {
            totalEstCareersCount += Object.keys(data.statsByFacultyAndCareer[f]).length;
        });

        const renderTable1Rows = () => {
            let html = '';
            let isFirstRow = true;

            data.reportingFaculties.forEach(f => {
                const careers = data.statsByFacultyAndCareer[f];
                const careerNames = Object.keys(careers);
                const facCareersCount = careerNames.length;
                if (facCareersCount === 0) return;

                let isFirstCareerInFac = true;

                careerNames.forEach(cName => {
                    const stats = careers[cName];
                    html += `<tr>`;

                    if (isFirstRow) {
                        html += `
                            <td rowspan="${totalEstCareersCount}" class="vertical-text-cell" style="writing-mode: vertical-lr; transform: rotate(180deg); font-weight: bold; text-align: center; vertical-align: middle; background-color: #f1f5f9; width: 25px; border: 1px solid #000; font-size: 10px;">
                                ESTUDIANTES
                            </td>
                        `;
                        isFirstRow = false;
                    }

                    if (isFirstCareerInFac) {
                        html += `
                            <td rowspan="${facCareersCount}" class="left-align font-bold" style="background-color: #f8fafc; border: 1px solid #000; vertical-align: middle; font-size: 8px; width: 140px;">
                                ${f}
                            </td>
                        `;
                        isFirstCareerInFac = false;
                    }

                    html += `
                        <td class="left-align" style="border: 1px solid #000; font-size: 8px;">${cName}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${stats.hombres}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${stats.mujeres}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${stats.lgbti}</td>
                        <td class="font-bold bg-gray" style="border: 1px solid #000; font-size: 8px;">${stats.total}</td>
                    </tr>
                    `;
                });
            });

            html += `
                <tr class="bg-gray font-bold" style="font-size: 8.5px;">
                    <td colspan="3" class="left-align">ESTUDIANTES</td>
                    <td>${data.genderCounts.estudiantes.hombres}</td>
                    <td>${data.genderCounts.estudiantes.mujeres}</td>
                    <td>${data.genderCounts.estudiantes.lgbti}</td>
                    <td class="bg-total">${data.totalEstudiantes}</td>
                </tr>
            `;

            html += `
                <tr class="bg-gray font-bold" style="font-size: 8.5px;">
                    <td colspan="3" class="left-align">ADMINISTRATIVOS</td>
                    <td>${data.genderCounts.administrativos.hombres}</td>
                    <td>${data.genderCounts.administrativos.mujeres}</td>
                    <td>${data.genderCounts.administrativos.lgbti}</td>
                    <td class="bg-total">${data.totalAdministrativos}</td>
                </tr>
            `;

            html += `
                <tr class="bg-gray font-bold" style="font-size: 8.5px;">
                    <td colspan="3" class="left-align">DOCENTES</td>
                    <td>${data.genderCounts.docentes.hombres}</td>
                    <td>${data.genderCounts.docentes.mujeres}</td>
                    <td>${data.genderCounts.docentes.lgbti}</td>
                    <td class="bg-total">${data.totalDocentes}</td>
                </tr>
            `;

            const totalH = data.genderCounts.estudiantes.hombres + data.genderCounts.administrativos.hombres + data.genderCounts.docentes.hombres;
            const totalM = data.genderCounts.estudiantes.mujeres + data.genderCounts.administrativos.mujeres + data.genderCounts.docentes.mujeres;
            const totalL = data.genderCounts.estudiantes.lgbti + data.genderCounts.administrativos.lgbti + data.genderCounts.docentes.lgbti;
            const grandTotal = data.totalPacientes;

            html += `
                <tr class="bg-total font-bold" style="font-size: 9px; background-color: #94a3b8 !important; color: #fff;">
                    <td colspan="3" class="left-align text-upper">TOTAL</td>
                    <td>${totalH}</td>
                    <td>${totalM}</td>
                    <td>${totalL}</td>
                    <td>${grandTotal}</td>
                </tr>
            `;

            return html;
        };

        const renderTable2Rows = () => {
            let html = '';
            let isFirstRow = true;

            data.reportingFaculties.forEach(f => {
                const careers = data.statsByFacultyAndCareer[f];
                const careerNames = Object.keys(careers);
                const facCareersCount = careerNames.length;
                if (facCareersCount === 0) return;

                let isFirstCareerInFac = true;

                let fPrevH = 0, fPrevM = 0, fPrevL = 0, fPrevT = 0;
                let fCurH = 0, fCurM = 0, fCurL = 0, fCurT = 0;
                let fGrandTotal = 0;

                careerNames.forEach(cName => {
                    const stats = careers[cName];

                    fPrevH += stats.preventiva.hombres;
                    fPrevM += stats.preventiva.mujeres;
                    fPrevL += stats.preventiva.lgbti;
                    fPrevT += stats.preventiva.total;

                    fCurH += stats.curativa.hombres;
                    fCurM += stats.curativa.mujeres;
                    fCurL += stats.curativa.lgbti;
                    fCurT += stats.curativa.total;

                    fGrandTotal += stats.total;

                    html += `<tr>`;

                    if (isFirstRow) {
                        const totalRowsSpanned = totalEstCareersCount + data.reportingFaculties.filter(fac => Object.keys(data.statsByFacultyAndCareer[fac]).length > 0).length;
                        html += `
                            <td rowspan="${totalRowsSpanned}" class="vertical-text-cell" style="writing-mode: vertical-lr; transform: rotate(180deg); font-weight: bold; text-align: center; vertical-align: middle; background-color: #f1f5f9; width: 25px; border: 1px solid #000; font-size: 10px;">
                                ESTUDIANTES
                            </td>
                        `;
                        isFirstRow = false;
                    }

                    if (isFirstCareerInFac) {
                        html += `
                            <td rowspan="${facCareersCount + 1}" class="left-align font-bold" style="background-color: #f8fafc; border: 1px solid #000; vertical-align: middle; font-size: 8px; width: 140px;">
                                ${f}
                            </td>
                        `;
                        isFirstCareerInFac = false;
                    }

                    html += `
                        <td class="left-align" style="border: 1px solid #000; font-size: 8px;">${cName}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${stats.preventiva.hombres}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${stats.preventiva.mujeres}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${stats.preventiva.lgbti}</td>
                        <td class="font-bold bg-gray" style="border: 1px solid #000; font-size: 8px;">${stats.preventiva.total}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${stats.curativa.hombres}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${stats.curativa.mujeres}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${stats.curativa.lgbti}</td>
                        <td class="font-bold bg-gray" style="border: 1px solid #000; font-size: 8px;">${stats.curativa.total}</td>
                        <td class="font-bold bg-total" style="border: 1px solid #000; font-size: 8px;">${stats.total}</td>
                    </tr>
                    `;
                });

                html += `
                    <tr class="font-bold bg-gray" style="font-size: 8px;">
                        <td class="left-align">TOTAL</td>
                        <td>${fPrevH}</td>
                        <td>${fPrevM}</td>
                        <td>${fPrevL}</td>
                        <td class="bg-total">${fPrevT}</td>
                        <td>${fCurH}</td>
                        <td>${fCurM}</td>
                        <td>${fCurL}</td>
                        <td class="bg-total">${fCurT}</td>
                        <td class="bg-total" style="background-color: #cbd5e1 !important;">${fGrandTotal}</td>
                    </tr>
                `;
            });

            let estPrevH = 0, estPrevM = 0, estPrevL = 0, estPrevT = 0;
            let estCurH = 0, estCurM = 0, estCurL = 0, estCurT = 0;
            let estGrandT = 0;

            data.reportingFaculties.forEach(f => {
                const careers = data.statsByFacultyAndCareer[f];
                Object.keys(careers).forEach(cName => {
                    const stats = careers[cName];
                    estPrevH += stats.preventiva.hombres;
                    estPrevM += stats.preventiva.mujeres;
                    estPrevL += stats.preventiva.lgbti;
                    estPrevT += stats.preventiva.total;
                    estCurH += stats.curativa.hombres;
                    estCurM += stats.curativa.mujeres;
                    estCurL += stats.curativa.lgbti;
                    estCurT += stats.curativa.total;
                    estGrandT += stats.total;
                });
            });

            const admPrevH = data.consolidadoStats.preventivo['Examen Odontológico'].administrativos.hombres;
            const admPrevM = data.consolidadoStats.preventivo['Examen Odontológico'].administrativos.mujeres;
            const admPrevL = data.consolidadoStats.preventivo['Examen Odontológico'].administrativos.lgbti;
            const admPrevT = data.consolidadoStats.preventivo['Examen Odontológico'].administrativos.total;

            let admCurH = 0, admCurM = 0, admCurL = 0, admCurT = 0;
            data.curativosDiagnoses.forEach(diag => {
                const r = data.consolidadoStats.curativo[diag].administrativos;
                admCurH += r.hombres;
                admCurM += r.mujeres;
                admCurL += r.lgbti;
                admCurT += r.total;
            });

            const docPrevH = data.consolidadoStats.preventivo['Examen Odontológico'].docentes.hombres;
            const docPrevM = data.consolidadoStats.preventivo['Examen Odontológico'].docentes.mujeres;
            const docPrevL = data.consolidadoStats.preventivo['Examen Odontológico'].docentes.lgbti;
            const docPrevT = data.consolidadoStats.preventivo['Examen Odontológico'].docentes.total;

            let docCurH = 0, docCurM = 0, docCurL = 0, docCurT = 0;
            data.curativosDiagnoses.forEach(diag => {
                const r = data.consolidadoStats.curativo[diag].docentes;
                docCurH += r.hombres;
                docCurM += r.mujeres;
                docCurL += r.lgbti;
                docCurT += r.total;
            });

            html += `
                <tr class="bg-gray font-bold" style="font-size: 8px;">
                    <td colspan="3" class="left-align">ESTUDIANTES</td>
                    <td>${estPrevH}</td><td>${estPrevM}</td><td>${estPrevL}</td><td class="bg-total">${estPrevT}</td>
                    <td>${estCurH}</td><td>${estCurM}</td><td>${estCurL}</td><td class="bg-total">${estCurT}</td>
                    <td class="bg-total" style="background-color: #cbd5e1 !important;">${estGrandT}</td>
                </tr>
            `;

            html += `
                <tr class="bg-gray font-bold" style="font-size: 8px;">
                    <td colspan="3" class="left-align">ADMINISTRATIVOS</td>
                    <td>${admPrevH}</td><td>${admPrevM}</td><td>${admPrevL}</td><td class="bg-total">${admPrevT}</td>
                    <td>${admCurH}</td><td>${admCurM}</td><td>${admCurL}</td><td class="bg-total">${admCurT}</td>
                    <td class="bg-total" style="background-color: #cbd5e1 !important;">${admPrevT + admCurT}</td>
                </tr>
            `;

            html += `
                <tr class="bg-gray font-bold" style="font-size: 8px;">
                    <td colspan="3" class="left-align">DOCENTES</td>
                    <td>${docPrevH}</td><td>${docPrevM}</td><td>${docPrevL}</td><td class="bg-total">${docPrevT}</td>
                    <td>${docCurH}</td><td>${docCurM}</td><td>${docCurL}</td><td class="bg-total">${docCurT}</td>
                    <td class="bg-total" style="background-color: #cbd5e1 !important;">${docPrevT + docCurT}</td>
                </tr>
            `;

            const gPrevH = estPrevH + admPrevH + docPrevH;
            const gPrevM = estPrevM + admPrevM + docPrevM;
            const gPrevL = estPrevL + admPrevL + docPrevL;
            const gPrevT = estPrevT + admPrevT + docPrevT;

            const gCurH = estCurH + admCurH + docCurH;
            const gCurM = estCurM + admCurM + docCurM;
            const gCurL = estCurL + admCurL + docCurL;
            const gCurT = estCurT + admCurT + docCurT;

            html += `
                <tr class="bg-total font-bold" style="font-size: 9px; background-color: #94a3b8 !important; color: #fff;">
                    <td colspan="3" class="left-align text-upper">TOTAL</td>
                    <td>${gPrevH}</td><td>${gPrevM}</td><td>${gPrevL}</td><td>${gPrevT}</td>
                    <td>${gCurH}</td><td>${gCurM}</td><td>${gCurL}</td><td>${gCurT}</td>
                    <td style="background-color: #64748b !important; color: #fff;">${gPrevT + gCurT}</td>
                </tr>
            `;

            return html;
        };

        const renderTable3Rows = () => {
            let html = '';

            html += `
                <tr style="background-color: #fed7aa; font-weight: bold; text-align: left; font-size: 8px;">
                    <td colspan="14" class="left-align" style="border: 1px solid #000; padding: 4px;">PREVENCION</td>
                </tr>
            `;

            const pExamen = data.consolidadoStats.preventivo['Examen Odontológico'];
            html += `
                <tr>
                    <td class="left-align font-bold" style="border: 1px solid #000; font-size: 8px; padding: 4px;">Examen Odontológico</td>
                    <td style="border: 1px solid #000; font-size: 8px;">${pExamen.estudiantes.hombres}</td>
                    <td style="border: 1px solid #000; font-size: 8px;">${pExamen.estudiantes.mujeres}</td>
                    <td style="border: 1px solid #000; font-size: 8px;">${pExamen.estudiantes.lgbti}</td>
                    <td class="font-bold bg-gray" style="border: 1px solid #000; font-size: 8px;">${pExamen.estudiantes.total}</td>
                    <td style="border: 1px solid #000; font-size: 8px;">${pExamen.administrativos.hombres}</td>
                    <td style="border: 1px solid #000; font-size: 8px;">${pExamen.administrativos.mujeres}</td>
                    <td style="border: 1px solid #000; font-size: 8px;">${pExamen.administrativos.lgbti}</td>
                    <td class="font-bold bg-gray" style="border: 1px solid #000; font-size: 8px;">${pExamen.administrativos.total}</td>
                    <td style="border: 1px solid #000; font-size: 8px;">${pExamen.docentes.hombres}</td>
                    <td style="border: 1px solid #000; font-size: 8px;">${pExamen.docentes.mujeres}</td>
                    <td style="border: 1px solid #000; font-size: 8px;">${pExamen.docentes.lgbti}</td>
                    <td class="font-bold bg-gray" style="border: 1px solid #000; font-size: 8px;">${pExamen.docentes.total}</td>
                    <td class="bg-total font-bold" style="border: 1px solid #000; font-size: 8px;">${pExamen.estudiantes.total + pExamen.administrativos.total + pExamen.docentes.total}</td>
                </tr>
            `;

            html += `
                <tr style="background-color: #ffedd5; font-weight: bold; text-align: left; font-size: 8px;">
                    <td colspan="14" class="left-align" style="border: 1px solid #000; padding: 4px;">CURATIVO</td>
                </tr>
            `;

            let estH = 0, estM = 0, estL = 0, estT = 0;
            let admH = 0, admM = 0, admL = 0, admT = 0;
            let docH = 0, docM = 0, docL = 0, docT = 0;

            data.curativosDiagnoses.forEach(diag => {
                const r = data.consolidadoStats.curativo[diag];

                estH += r.estudiantes.hombres;
                estM += r.estudiantes.mujeres;
                estL += r.estudiantes.lgbti;
                estT += r.estudiantes.total;

                admH += r.administrativos.hombres;
                admM += r.administrativos.mujeres;
                admL += r.administrativos.lgbti;
                admT += r.administrativos.total;

                docH += r.docentes.hombres;
                docM += r.docentes.mujeres;
                docL += r.docentes.lgbti;
                docT += r.docentes.total;

                const rowGrand = r.estudiantes.total + r.administrativos.total + r.docentes.total;

                html += `
                    <tr>
                        <td class="left-align font-bold" style="border: 1px solid #000; font-size: 8px; padding: 4px;">${diag}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${r.estudiantes.hombres || ''}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${r.estudiantes.mujeres || ''}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${r.estudiantes.lgbti || ''}</td>
                        <td class="font-bold bg-gray" style="border: 1px solid #000; font-size: 8px;">${r.estudiantes.total || '0'}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${r.administrativos.hombres || ''}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${r.administrativos.mujeres || ''}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${r.administrativos.lgbti || ''}</td>
                        <td class="font-bold bg-gray" style="border: 1px solid #000; font-size: 8px;">${r.administrativos.total || '0'}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${r.docentes.hombres || ''}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${r.docentes.mujeres || ''}</td>
                        <td style="border: 1px solid #000; font-size: 8px;">${r.docentes.lgbti || ''}</td>
                        <td class="font-bold bg-gray" style="border: 1px solid #000; font-size: 8px;">${r.docentes.total || '0'}</td>
                        <td class="bg-total font-bold" style="border: 1px solid #000; font-size: 8px;">${rowGrand}</td>
                    </tr>
                `;
            });

            const finalEstH = pExamen.estudiantes.hombres + estH;
            const finalEstM = pExamen.estudiantes.mujeres + estM;
            const finalEstL = pExamen.estudiantes.lgbti + estL;
            const finalEstT = pExamen.estudiantes.total + estT;

            const finalAdmH = pExamen.administrativos.hombres + admH;
            const finalAdmM = pExamen.administrativos.mujeres + admM;
            const finalAdmL = pExamen.administrativos.lgbti + admL;
            const finalAdmT = pExamen.administrativos.total + admT;

            const finalDocH = pExamen.docentes.hombres + docH;
            const finalDocM = pExamen.docentes.mujeres + docM;
            const finalDocL = pExamen.docentes.lgbti + docL;
            const finalDocT = pExamen.docentes.total + docT;

            const overallGrandTotal = finalEstT + finalAdmT + finalDocT;

            html += `
                <tr class="bg-total font-bold" style="font-size: 8.5px; background-color: #cbd5e1 !important; border: 1px solid #000;">
                    <td class="left-align" style="border: 1px solid #000; padding: 4px;">TOTAL</td>
                    <td style="border: 1px solid #000;">${finalEstH}</td>
                    <td style="border: 1px solid #000;">${finalEstM}</td>
                    <td style="border: 1px solid #000;">${finalEstL}</td>
                    <td style="border: 1px solid #000;">${finalEstT}</td>
                    <td style="border: 1px solid #000;">${finalAdmH}</td>
                    <td style="border: 1px solid #000;">${finalAdmM}</td>
                    <td style="border: 1px solid #000;">${finalAdmL}</td>
                    <td style="border: 1px solid #000;">${finalAdmT}</td>
                    <td style="border: 1px solid #000;">${finalDocH}</td>
                    <td style="border: 1px solid #000;">${finalDocM}</td>
                    <td style="border: 1px solid #000;">${finalDocL}</td>
                    <td style="border: 1px solid #000;">${finalDocT}</td>
                    <td style="background-color: #94a3b8 !important; color: #fff; border: 1px solid #000;">${overallGrandTotal}</td>
                </tr>
            `;

            return html;
        };

        const renderSingleCareerTableHtml = (careerName) => {
            const cStats = data.careerIndividualStats[careerName];
            const pVal = cStats.preventivo['Examen Odontológico'];

            let curH = 0, curM = 0, curL = 0, curT = 0;
            const curRowsHtml = data.curativosDiagnoses.map(diag => {
                const r = cStats.curativo[diag];
                curH += r.hombres;
                curM += r.mujeres;
                curL += r.lgbti;
                curT += r.total;

                return `
                    <tr>
                        <td class="left-align font-bold" style="border: 1px solid #000; font-size: 7.5px; padding: 3px;">${diag}</td>
                        <td style="border: 1px solid #000; font-size: 7.5px; padding: 3px; text-align: center;">${r.hombres || ''}</td>
                        <td style="border: 1px solid #000; font-size: 7.5px; padding: 3px; text-align: center;">${r.mujeres || ''}</td>
                        <td style="border: 1px solid #000; font-size: 7.5px; padding: 3px; text-align: center;">${r.lgbti || ''}</td>
                        <td class="font-bold bg-gray" style="border: 1px solid #000; font-size: 7.5px; padding: 3px; text-align: center;">${r.total || '0'}</td>
                    </tr>
                `;
            }).join('');

            const finalH = pVal.hombres + curH;
            const finalM = pVal.mujeres + curM;
            const finalL = pVal.lgbti + curL;
            const finalT = pVal.total + curT;

            return `
                <table class="report-table" style="font-size: 8px; border-collapse: collapse; width: 100%; border: 1px solid #000; margin-bottom: 5px;">
                    <thead>
                        <tr>
                            <td style="width: 15%; font-weight: bold; font-size: 10px; text-align: center; border: 1px solid #000; padding: 4px;">
                                UEB
                            </td>
                            <td colspan="3" style="width: 60%; font-weight: bold; text-align: center; font-size: 9px; border: 1px solid #000; padding: 4px;">
                                UNIVERSIDAD ESTATAL DE BOLÍVAR<br>
                                BIENESTAR UNIVERSITARIO
                            </td>
                            <td style="width: 25%; font-weight: bold; text-align: center; font-size: 8px; border: 1px solid #000; padding: 4px;">
                                BIENESTAR UNIVERSITARIO
                            </td>
                        </tr>
                        <tr style="background-color: #cbd5e1; font-weight: bold;">
                            <td colspan="5" style="text-align: center; font-size: 9px; padding: 4px; border: 1px solid #000; text-transform: uppercase;">
                                ATENCIONES DE ODONTOLOGÍA - ${selectedMonthText.toUpperCase()} ${genReportYear}
                            </td>
                        </tr>
                        <tr style="font-weight: bold;">
                            <td style="text-align: left; background-color: #d1fae5; font-size: 8.5px; padding: 4px; border: 1px solid #000; text-transform: uppercase; width: 50%;">
                                ${careerName}
                            </td>
                            <td colspan="4" style="text-align: center; background-color: #ffedd5; font-size: 8.5px; padding: 4px; border: 1px solid #000;">
                                ESTUDIANTES
                            </td>
                        </tr>
                        <tr style="background-color: #cbd5e1; text-align: left; font-weight: bold;">
                            <th class="left-align" style="font-size: 8px; padding: 4px; border: 1px solid #000; width: 50%;">PREVENCION</th>
                            <th style="font-size: 8px; padding: 4px; text-align: center; width: 12%; border: 1px solid #000;">MASCULINO</th>
                            <th style="font-size: 8px; padding: 4px; text-align: center; width: 12%; border: 1px solid #000;">FEMENINO</th>
                            <th style="font-size: 8px; padding: 4px; text-align: center; width: 12%; border: 1px solid #000;">LGBTI</th>
                            <th style="font-size: 8px; padding: 4px; text-align: center; width: 14%; border: 1px solid #000;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="left-align font-bold" style="border: 1px solid #000; font-size: 7.5px; padding: 3px;">Examen Odontológico</td>
                            <td style="border: 1px solid #000; font-size: 7.5px; padding: 3px; text-align: center;">${pVal.hombres || ''}</td>
                            <td style="border: 1px solid #000; font-size: 7.5px; padding: 3px; text-align: center;">${pVal.mujeres || ''}</td>
                            <td style="border: 1px solid #000; font-size: 7.5px; padding: 3px; text-align: center;">${pVal.lgbti || ''}</td>
                            <td class="font-bold bg-gray" style="border: 1px solid #000; font-size: 7.5px; padding: 3px; text-align: center;">${pVal.total || '0'}</td>
                        </tr>
                        <tr style="background-color: #cbd5e1; font-weight: bold; text-align: left;">
                            <td class="left-align" style="font-size: 8px; padding: 4px; border: 1px solid #000;">CURATIVO</td>
                            <td style="font-size: 8px; padding: 4px; text-align: center; border: 1px solid #000;">MASCULINO</td>
                            <td style="font-size: 8px; padding: 4px; text-align: center; border: 1px solid #000;">FEMENINO</td>
                            <td style="font-size: 8px; padding: 4px; text-align: center; border: 1px solid #000;">LGBTI</td>
                            <td style="font-size: 8px; padding: 4px; text-align: center; border: 1px solid #000;">TOTAL</td>
                        </tr>
                        ${curRowsHtml}
                        <tr class="bg-total font-bold" style="font-size: 8px; background-color: #cbd5e1 !important;">
                            <td class="left-align" style="padding: 4px; border: 1px solid #000;">TOTAL</td>
                            <td style="border: 1px solid #000; text-align: center;">${finalH}</td>
                            <td style="border: 1px solid #000; text-align: center;">${finalM}</td>
                            <td style="border: 1px solid #000; text-align: center;">${finalL}</td>
                            <td style="border: 1px solid #000; text-align: center;">${finalT}</td>
                        </tr>
                    </tbody>
                </table>
                <div style="font-size: 9px; text-align: right; margin-right: 5px; font-weight: bold; color: #000; margin-bottom: 15px;">TOTAL PACIENTES: ${finalT}</div>
            `;
        };

        const renderIndividualCareerTables = () => {
            const activeCareers = Object.keys(data.careerIndividualStats).sort();
            if (activeCareers.length === 0) {
                return `
                    <div class="page-container page-break" style="margin-top: 15px;">
                        <p style="font-style: italic; color: #666; text-align: center;">No se registraron atenciones a estudiantes de carreras específicas este mes.</p>
                        <div class="footnote-address">
                            Dirección: Av. Ernesto Che Guevara y Gabriel Secaira · Guaranda-Ecuador · Teléfono: (593) 3220 6010 EXT 1168 · www.ueb.edu.ec
                        </div>
                    </div>
                `;
            }

            let html = '';
            for (let i = 0; i < activeCareers.length; i += 2) {
                html += `
                    <div class="page-container page-break" style="padding-top: 15px;">
                        <div style="text-align: center; margin-bottom: 15px;">
                            <span style="font-weight: bold; font-size: 11px; text-transform: uppercase;">
                                FICHA ESTADÍSTICA DE ATENCIONES ODONTOLÓGICAS POR CARRERA
                            </span>
                        </div>
                `;

                const cNameA = activeCareers[i];
                html += renderSingleCareerTableHtml(cNameA);

                if (i + 1 < activeCareers.length) {
                    const cNameB = activeCareers[i + 1];
                    html += `<div style="margin-top: 25px; border-top: 1px dashed #cbd5e1; padding-top: 15px;"></div>`;
                    html += renderSingleCareerTableHtml(cNameB);
                }

                html += `
                        <div class="footnote-address">
                            Dirección: Av. Ernesto Che Guevara y Gabriel Secaira · Guaranda-Ecuador · Teléfono: (593) 3220 6010 EXT 1168 · www.ueb.edu.ec
                        </div>
                    </div>
                `;
            }

            return html;
        };

        const renderProceduresRows = (procObj) => {
            const keys = Object.keys(procObj);
            let totalEstH = 0, totalEstM = 0, totalEstL = 0;
            let totalAdmH = 0, totalAdmM = 0, totalAdmL = 0;
            let totalDocH = 0, totalDocM = 0, totalDocL = 0;

            const rowsHtml = keys.map(k => {
                const r = procObj[k];
                totalEstH += r.estudiantes.hombres;
                totalEstM += r.estudiantes.mujeres;
                totalEstL += r.estudiantes.lgbti;
                totalAdmH += r.administrativos.hombres;
                totalAdmM += r.administrativos.mujeres;
                totalAdmL += r.administrativos.lgbti;
                totalDocH += r.docentes.hombres;
                totalDocM += r.docentes.mujeres;
                totalDocL += r.docentes.lgbti;

                return `
                    <tr>
                        <td class="left-align font-bold" style="border: 1px solid #000; font-size: 8px; padding: 4px;">${k}</td>
                        <td style="border: 1px solid #000;">${r.estudiantes.hombres || ''}</td>
                        <td style="border: 1px solid #000;">${r.estudiantes.mujeres || ''}</td>
                        <td style="border: 1px solid #000;">${r.estudiantes.lgbti || ''}</td>
                        <td class="font-bold bg-gray" style="border: 1px solid #000;">${r.estudiantes.hombres + r.estudiantes.mujeres + r.estudiantes.lgbti}</td>
                        <td style="border: 1px solid #000;">${r.administrativos.hombres || ''}</td>
                        <td style="border: 1px solid #000;">${r.administrativos.mujeres || ''}</td>
                        <td style="border: 1px solid #000;">${r.administrativos.lgbti || ''}</td>
                        <td class="font-bold bg-gray" style="border: 1px solid #000;">${r.administrativos.hombres + r.administrativos.mujeres + r.administrativos.lgbti}</td>
                        <td style="border: 1px solid #000;">${r.docentes.hombres || ''}</td>
                        <td style="border: 1px solid #000;">${r.docentes.mujeres || ''}</td>
                        <td style="border: 1px solid #000;">${r.docentes.lgbti || ''}</td>
                        <td class="font-bold bg-gray" style="border: 1px solid #000;">${r.docentes.hombres + r.docentes.mujeres + r.docentes.lgbti}</td>
                        <td class="bg-total font-bold" style="border: 1px solid #000;">${r.estudiantes.hombres + r.estudiantes.mujeres + r.estudiantes.lgbti + r.administrativos.hombres + r.administrativos.mujeres + r.administrativos.lgbti + r.docentes.hombres + r.docentes.mujeres + r.docentes.lgbti}</td>
                    </tr>
                `;
            }).join('');

            const grandEstTotal = totalEstH + totalEstM + totalEstL;
            const grandAdmTotal = totalAdmH + totalAdmM + totalAdmL;
            const grandDocTotal = totalDocH + totalDocM + totalDocL;
            const grandTotal = grandEstTotal + grandAdmTotal + grandDocTotal;

            const footerHtml = `
                <tr class="bg-total font-bold" style="font-size: 8.5px; background-color: #cbd5e1 !important; border: 1px solid #000;">
                    <td class="left-align" style="border: 1px solid #000; padding: 4px;">TOTAL</td>
                    <td style="border: 1px solid #000;">${totalEstH}</td>
                    <td style="border: 1px solid #000;">${totalEstM}</td>
                    <td style="border: 1px solid #000;">${totalEstL}</td>
                    <td style="border: 1px solid #000;">${grandEstTotal}</td>
                    <td style="border: 1px solid #000;">${totalAdmH}</td>
                    <td style="border: 1px solid #000;">${totalAdmM}</td>
                    <td style="border: 1px solid #000;">${totalAdmL}</td>
                    <td style="border: 1px solid #000;">${grandAdmTotal}</td>
                    <td style="border: 1px solid #000;">${totalDocH}</td>
                    <td style="border: 1px solid #000;">${totalDocM}</td>
                    <td style="border: 1px solid #000;">${totalDocL}</td>
                    <td style="border: 1px solid #000;">${grandDocTotal}</td>
                    <td style="background-color: #94a3b8 !important; color: #fff; border: 1px solid #000;">${grandTotal}</td>
                </tr>
            `;
            return rowsHtml + footerHtml;
        };

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Informe General de Atenciones - ${selectedMonthText} ${genReportYear}</title>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 10px;
                        line-height: 1.4;
                        color: #000;
                        margin: 0;
                        padding: 0;
                        background: #f1f5f9;
                    }
                    .page-container {
                        width: 210mm;
                        min-height: 297mm;
                        padding: 20mm;
                        margin: 20px auto;
                        background: #fff;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        box-sizing: border-box;
                        border-radius: 4px;
                        position: relative;
                    }
                    .page-break {
                        page-break-after: always;
                    }
                    @media print {
                        body {
                            background: #fff;
                            padding: 0;
                            margin: 0;
                        }
                        .page-container {
                            width: 100%;
                            min-height: auto;
                            padding: 0;
                            margin: 0;
                            box-shadow: none;
                            background: #fff;
                        }
                    }
                    .branding-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                    }
                    .branding-table td {
                        border: 1px solid #000;
                        padding: 6px;
                        text-align: center;
                        vertical-align: middle;
                    }
                    .branding-title {
                        font-size: 12px;
                        font-weight: bold;
                        color: #003366;
                        text-transform: uppercase;
                    }
                    .branding-subtitle {
                        font-size: 10px;
                        font-weight: bold;
                        color: #b71a34;
                        margin-top: 3px;
                    }
                    .general-data-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                        font-size: 9px;
                    }
                    .general-data-table td, .general-data-table th {
                        border: 1px solid #000;
                        padding: 5px 6px;
                        vertical-align: top;
                    }
                    .general-data-table th {
                        background-color: #f1f5f9;
                        text-transform: uppercase;
                        font-weight: bold;
                        text-align: center;
                    }
                    .report-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 8px;
                        margin-bottom: 12px;
                        border: 1px solid #000;
                    }
                    .report-table th, .report-table td {
                        border: 1px solid #000;
                        padding: 4px;
                        text-align: center;
                    }
                    .report-table th {
                        font-weight: bold;
                        font-size: 8px;
                    }
                    .bg-gray {
                        background-color: #f1f5f9 !important;
                    }
                    .bg-total {
                        background-color: #cbd5e1 !important;
                    }
                    .left-align {
                        text-align: left !important;
                    }
                    .font-bold {
                        font-weight: bold;
                    }
                    .text-upper {
                        text-transform: uppercase;
                    }
                    h2 {
                        font-size: 11px;
                        font-weight: bold;
                        margin-top: 15px;
                        margin-bottom: 6px;
                        text-transform: uppercase;
                        border-bottom: 1px solid #000;
                        padding-bottom: 2px;
                    }
                    h3 {
                        font-size: 10px;
                        font-weight: bold;
                        margin-top: 12px;
                        margin-bottom: 5px;
                        text-transform: uppercase;
                    }
                    p, li {
                        font-size: 10px;
                        text-align: justify;
                        margin-bottom: 8px;
                    }
                    .footnote-address {
                        margin-top: 30px;
                        font-size: 7.5px;
                        color: #64748b;
                        border-top: 1px solid #cbd5e1;
                        padding-top: 6px;
                        text-align: center;
                    }
                    @media print {
                        body, table, th, td {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                </style>
            </head>
            <body>
                <!-- PÁGINA 1 -->
                <div class="page-container page-break">
                    <table class="branding-table">
                        <tr>
                            <td style="width: 15%; font-weight: 800; font-size: 18px; color: #003366;">
                                UEB
                            </td>
                            <td style="width: 60%;">
                                <div class="branding-title">Universidad Estatal de Bolívar</div>
                                <div class="branding-subtitle">Informe General - Departamento de Bienestar Universitario</div>
                            </td>
                            <td style="width: 25%; font-size: 8px; text-align: left; line-height: 1.3;">
                                <strong>VERSIÓN:</strong> 1.0<br>
                                <strong>DEPARTAMENTO:</strong> Bienestar Univ.<br>
                                <strong>SISTEMA:</strong> Gestión Clínica
                            </td>
                        </tr>
                    </table>

                    <table class="general-data-table">
                        <tr>
                            <th colspan="6">Datos Generales</th>
                        </tr>
                        <tr>
                            <td style="width: 20%;"><strong>Fecha de Informe</strong></td>
                            <td style="width: 30%;">${new Date().toLocaleDateString('es-ES')}</td>
                            <td style="width: 20%;"><strong>No. De Informe</strong></td>
                            <td style="width: 30%;" colspan="3">${reportNo}</td>
                        </tr>
                        <tr>
                            <td rowspan="2"><strong>Funcionario Responsable</strong></td>
                            <td rowspan="2">${doctorNameText}<br><span style="font-size: 8px; color: #555;">Odontóloga de Bienestar Universitario</span></td>
                            <td colspan="3" style="text-align: center;"><strong>Contacto</strong></td>
                            <td rowspan="2"><strong>Cargo</strong></td>
                        </tr>
                        <tr style="font-size: 8px;">
                            <td>Ext. Tel.: 167/168</td>
                            <td colspan="2">${doctorEmail}</td>
                            <td>Odontóloga</td>
                        </tr>
                        <tr>
                            <td rowspan="2"><strong>Informe dirigido a:</strong></td>
                            <td rowspan="2">Michel Gaibor Vásquez</td>
                            <td colspan="3" style="text-align: center;"><strong>Contacto</strong></td>
                            <td rowspan="2">Coordinadora de Bienestar Universitario</td>
                        </tr>
                        <tr style="font-size: 8px;">
                            <td>Ext. Tel.: 167/168</td>
                            <td colspan="2">sgaibor@ueb.gob.ec</td>
                            <td>Coordinadora</td>
                        </tr>
                        <tr>
                            <td colspan="6"><strong>ASUNTO:</strong> Informe mensual de atenciones odontológicas del mes de ${selectedMonthText.toLowerCase()}.</td>
                        </tr>
                    </table>

                    <h2>1. Antecedentes</h2>
                    <p>
                        El Departamento de Bienestar Universitario fue concebido como un órgano de apoyo y de atención a la salud integral de toda la comunidad estudiantil, docente y administrativa de la Universidad Estatal de Bolívar. Dentro de sus principales responsabilidades, se encuentra la prestación continua de servicios médicos, odontológicos y psicológicos de alta calidad y accesibilidad.
                    </p>
                    <p>
                        A través del Servicio de Odontología, se realizan mensualmente diagnósticos preventivos y curativos con la finalidad de promover el cuidado buco-dental de la población universitaria, sistematizando el registro de cada atención clínica mediante partes diarios integrados a la base de datos de Bienestar Universitario.
                    </p>

                    <h2>2. Actividades</h2>
                    <ul>
                        <li>Promoción y educación para la salud buco-dental en estudiantes.</li>
                        <li>Atención y diagnóstico preventivo (Examen Odontológico general).</li>
                        <li>Atención curativa o de morbilidad (tratamiento de caries, extracciones, pulpitis, destartrajes, etc.).</li>
                        <li>Registro digital de evolución odontológica y prescripciones en el sistema integrado.</li>
                        <li>Planificación y control mensual de consumo de insumos del consultorio clínico.</li>
                    </ul>

                    <h2>3. Análisis de Resultados (Resumen de Comunidad Universitaria)</h2>
                    <table class="report-table" style="max-width: 450px; margin-top: 10px; margin-bottom: 20px;">
                        <thead>
                            <tr class="bg-gray" style="font-size: 8.5px;">
                                <th style="text-align: left; padding: 6px;">COMUNIDAD UNIVERSITARIA</th>
                                <th style="width: 120px; padding: 6px;">TOTAL ATENCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="left-align" style="padding: 5px;">ESTUDIANTES</td>
                                <td class="font-bold" style="padding: 5px; font-size: 9px;">${data.totalEstudiantes}</td>
                            </tr>
                            <tr>
                                <td class="left-align" style="padding: 5px;">ADMINISTRATIVOS</td>
                                <td class="font-bold" style="padding: 5px; font-size: 9px;">${data.totalAdministrativos}</td>
                            </tr>
                            <tr>
                                <td class="left-align" style="padding: 5px;">DOCENTES</td>
                                <td class="font-bold" style="padding: 5px; font-size: 9px;">${data.totalDocentes}</td>
                            </tr>
                            <tr class="bg-total font-bold" style="font-size: 9.5px; background-color: #94a3b8 !important; color: #fff;">
                                <td class="left-align" style="padding: 6px;">TOTAL GENERAL</td>
                                <td style="padding: 6px;">${data.totalPacientes}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="footnote-address">
                        Dirección: Av. Ernesto Che Guevara y Gabriel Secaira · Guaranda-Ecuador · Teléfono: (593) 3220 6010 EXT 1168 · www.ueb.edu.ec
                    </div>
                </div>

                <!-- PÁGINA 2: DETALLE POR CARRERAS -->
                <div class="page-container page-break" style="padding-top: 15px;">
                    <div style="text-align: center; margin-bottom: 10px;">
                        <span style="font-weight: bold; font-size: 11px;">
                            TABLA 1: ATENCIONES GENERALES POR FACULTAD Y CARRERA (ESTUDIANTES, ADMINISTRATIVOS, DOCENTES)
                        </span>
                    </div>

                    <table class="report-table" style="border: 1.5px solid #000;">
                        <thead>
                            <tr class="bg-gray" style="font-size: 8.5px; background-color: #cbd5e1 !important;">
                                <th colspan="3" style="text-align: left; padding: 5px;">FACULTAD / CARRERA</th>
                                <th style="width: 12%;">HOMBRES</th>
                                <th style="width: 12%;">MUJERES</th>
                                <th style="width: 12%;">LGBTI</th>
                                <th style="width: 15%; background-color: #94a3b8 !important; color: #fff;">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderTable1Rows()}
                        </tbody>
                    </table>

                    <div class="footnote-address">
                        Dirección: Av. Ernesto Che Guevara y Gabriel Secaira · Guaranda-Ecuador · Teléfono: (593) 3220 6010 EXT 1168 · www.ueb.edu.ec
                    </div>
                </div>

                <!-- PÁGINA 3: COMPARATIVA PREVENTIVA Y CURATIVA -->
                <div class="page-container page-break" style="padding-top: 15px;">
                    <div style="text-align: center; margin-bottom: 10px;">
                        <span style="font-weight: bold; font-size: 11px;">
                            TABLA 2: DISTRIBUCIÓN DE ATENCIONES PREVENTIVAS Y CURATIVAS POR FACULTAD Y CARRERA
                        </span>
                    </div>

                    <table class="report-table" style="border: 1.5px solid #000;">
                        <thead>
                            <tr class="bg-gray" style="font-size: 8px; background-color: #cbd5e1 !important;">
                                <th rowspan="2" colspan="3" style="text-align: left; vertical-align: middle; padding: 4px;">FACULTAD / CARRERA</th>
                                <th colspan="4" style="padding: 4px;">ODONTOLOGÍA PREVENTIVA</th>
                                <th colspan="4" style="padding: 4px;">ODONTOLOGÍA CURATIVA</th>
                                <th rowspan="2" style="vertical-align: middle; background-color: #94a3b8 !important; color: #fff; padding: 4px;">TOTAL</th>
                            </tr>
                            <tr class="bg-gray" style="font-size: 7.5px;">
                                <th>MASC.</th><th>FEM.</th><th>LGBTI</th><th class="font-bold">TOTAL</th>
                                <th>MASC.</th><th>FEM.</th><th>LGBTI</th><th class="font-bold">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderTable2Rows()}
                        </tbody>
                    </table>

                    <div class="footnote-address">
                        Dirección: Av. Ernesto Che Guevara y Gabriel Secaira · Guaranda-Ecuador · Teléfono: (593) 3220 6010 EXT 1168 · www.ueb.edu.ec
                    </div>
                </div>

                <!-- PÁGINA 4: CONSOLIDADO DE ATENCIONES -->
                <div class="page-container page-break" style="padding-top: 15px;">
                    <div style="text-align: center; margin-bottom: 10px;">
                        <span style="font-weight: bold; font-size: 11px;">
                            TABLA 3: CONSOLIDADO DE ATENCIONES PREVENTIVAS Y CURATIVAS POR TIPO DE USUARIO
                        </span>
                    </div>

                    <table class="report-table" style="border: 1.5px solid #000;">
                        <thead>
                            <tr class="bg-gray" style="font-size: 8px; background-color: #cbd5e1 !important;">
                                <th rowspan="2" style="text-align: left; vertical-align: middle; padding: 5px; width: 35%;">PREVENCIÓN / MORBILIDAD</th>
                                <th colspan="4" style="padding: 4px;">ESTUDIANTES</th>
                                <th colspan="4" style="padding: 4px;">ADMINISTRATIVOS</th>
                                <th colspan="4" style="padding: 4px;">DOCENTES</th>
                                <th rowspan="2" style="vertical-align: middle; background-color: #94a3b8 !important; color: #fff; padding: 4px; width: 8%;">TOTAL</th>
                            </tr>
                            <tr class="bg-gray" style="font-size: 7.5px;">
                                <th>M.</th><th>F.</th><th>L.</th><th class="font-bold">T.</th>
                                <th>M.</th><th>F.</th><th>L.</th><th class="font-bold">T.</th>
                                <th>M.</th><th>F.</th><th>L.</th><th class="font-bold">T.</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderTable3Rows()}
                        </tbody>
                    </table>

                    <div class="footnote-address">
                        Dirección: Av. Ernesto Che Guevara y Gabriel Secaira · Guaranda-Ecuador · Teléfono: (593) 3220 6010 EXT 1168 · www.ueb.edu.ec
                    </div>
                </div>

                <!-- PÁGINAS 5+: FICHAS INDIVIDUALES POR CARRERA -->
                ${renderIndividualCareerTables()}

                <!-- PÁGINA DE PROCEDIMIENTOS Y ANEXOS -->
                <div class="page-container page-break" style="padding-top: 15px;">
                    <div style="text-align: center; margin-bottom: 10px;">
                        <span style="font-weight: bold; font-size: 11px;">
                            TABLA 4: CONSOLIDADO DE PROCEDIMIENTOS PREVENTIVOS Y DE MORBILIDAD
                        </span>
                    </div>

                    <h3>Procedimientos Preventivos:</h3>
                    <table class="report-table" style="border: 1.5px solid #000;">
                        <thead>
                            <tr class="bg-gray" style="font-size: 8px; background-color: #cbd5e1 !important;">
                                <th rowspan="2" style="text-align: left; vertical-align: middle; padding: 4px;">PROCEDIMIENTOS PREVENTIVOS</th>
                                <th colspan="4">ESTUDIANTES</th>
                                <th colspan="4">ADMINISTRATIVOS</th>
                                <th colspan="4">DOCENTES</th>
                                <th rowspan="2" style="vertical-align: middle; background-color: #94a3b8 !important; color: #fff; padding: 4px;">TOTAL</th>
                            </tr>
                            <tr class="bg-gray" style="font-size: 7.5px;">
                                <th>MASC.</th><th>FEM.</th><th>LGBTI</th><th class="font-bold">TOTAL</th>
                                <th>MASC.</th><th>FEM.</th><th>LGBTI</th><th class="font-bold">TOTAL</th>
                                <th>MASC.</th><th>FEM.</th><th>LGBTI</th><th class="font-bold">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderProceduresRows(data.procPreventivos)}
                        </tbody>
                    </table>

                    <h3>Procedimientos de Morbilidad:</h3>
                    <table class="report-table" style="border: 1.5px solid #000;">
                        <thead>
                            <tr class="bg-gray" style="font-size: 8px; background-color: #cbd5e1 !important;">
                                <th rowspan="2" style="text-align: left; vertical-align: middle; padding: 4px;">PROCEDIMIENTOS MORBILIDAD</th>
                                <th colspan="4">ESTUDIANTES</th>
                                <th colspan="4">ADMINISTRATIVOS</th>
                                <th colspan="4">DOCENTES</th>
                                <th rowspan="2" style="vertical-align: middle; background-color: #94a3b8 !important; color: #fff; padding: 4px;">TOTAL</th>
                            </tr>
                            <tr class="bg-gray" style="font-size: 7.5px;">
                                <th>MASC.</th><th>FEM.</th><th>LGBTI</th><th class="font-bold">TOTAL</th>
                                <th>MASC.</th><th>FEM.</th><th>LGBTI</th><th class="font-bold">TOTAL</th>
                                <th>MASC.</th><th>FEM.</th><th>LGBTI</th><th class="font-bold">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderProceduresRows(data.procMorbilidad)}
                        </tbody>
                    </table>

                    <div class="footnote-address">
                        Dirección: Av. Ernesto Che Guevara y Gabriel Secaira · Guaranda-Ecuador · Teléfono: (593) 3220 6010 EXT 1168 · www.ueb.edu.ec
                    </div>
                </div>

                <!-- PÁGINA FINAL: CONCLUSIONES Y FIRMAS -->
                <div class="page-container" style="padding-top: 15px;">
                    <h2>4. Conclusiones</h2>
                    <p>
                        El Servicio de Odontología del Departamento de Bienestar Universitario garantiza con éxito el derecho a la salud buco-dental de toda la población de la Universidad Estatal de Bolívar. Durante este período se logró cubrir atenciones preventivas fundamentales mediante el examen odontológico de rutina, reduciendo el riesgo de patologías severas.
                    </p>
                    <p>
                        Asimismo, la morbilidad odontológica (tratamientos curativos de caries de esmalte, dentina, pulpitis, extracciones y destartrajes) fue atendida con profesionalismo y celeridad, logrando rehabilitar la salud oral y permitiendo un adecuado desempeño académico y laboral de los usuarios atendidos.
                    </p>

                    <h2>5. Recomendaciones</h2>
                    <p>
                        1. Mantener un stock permanente y oportuno de materiales e insumos odontológicos esenciales, asegurando la continuidad operativa del consultorio dental.
                    </p>
                    <p>
                        2. Fomentar talleres informativos sobre técnicas de cepillado e higiene oral en las carreras que registraron menor tasa de atenciones preventivas durante este período académico.
                    </p>

                    <h2>6. Anexos</h2>
                    <p style="font-size: 10px; margin-bottom: 15px;">
                        Adjunto 18 fojas, copias a color partes diarios.
                    </p>

                    <table class="report-table" style="width: 100%; border-collapse: collapse; margin-top: 25px; border: 1px solid #000; font-size: 9px;">
                        <thead>
                            <tr style="background-color: #cbd5e1; font-weight: bold;">
                                <td style="border: 1px solid #000; padding: 6px; text-align: left; width: 30%; font-weight: bold; background-color: #f1f5f9;">Datos</td>
                                <td style="border: 1px solid #000; padding: 6px; text-align: center; width: 35%; font-weight: bold;">Elaborado por:</td>
                                <td style="border: 1px solid #000; padding: 6px; text-align: center; width: 35%; font-weight: bold;">Revisado y Aprobado por:</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border: 1px solid #000; padding: 12px 6px; text-align: left; font-weight: bold; background-color: #f1f5f9; height: 60px;">Firmas</td>
                                <td style="border: 1px solid #000; padding: 6px; text-align: center; height: 60px;"></td>
                                <td style="border: 1px solid #000; padding: 6px; text-align: center; height: 60px;"></td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #000; padding: 6px; text-align: left; font-weight: bold; background-color: #f1f5f9;">Nombre y Apellido</td>
                                <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">${doctorNameText}</td>
                                <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">Michel Gaibor Vásquez</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #000; padding: 6px; text-align: left; font-weight: bold; background-color: #f1f5f9;">Cargo</td>
                                <td style="border: 1px solid #000; padding: 6px; text-align: center; color: #334155;">Odontóloga de Bienestar Universitario</td>
                                <td style="border: 1px solid #000; padding: 6px; text-align: center; color: #334155;">Coordinadora de Bienestar Universitario</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="footnote-address" style="margin-top: 80px;">
                        Dirección: Av. Ernesto Che Guevara y Gabriel Secaira · Guaranda-Ecuador · Teléfono: (593) 3220 6010 EXT 1168 · www.ueb.edu.ec
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 300);
                    };
                </script>
            </body>
            </html>
        `;
    };

    const handlePrintGeneralReport = () => {
        if (!genReportData) return;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(compileGeneralReportHtmlString(genReportData));
        printWindow.document.close();
    };

    useEffect(() => {
        if (activeTab === 'insumos') {
            fetchCatalogoInsumos();
        }
    }, [activeTab]);

    const handleOpenAddInsumo = (insumo = null) => {
        if (insumo) {
            setInsumoForm({
                id: insumo.id,
                nombre: insumo.nombre,
                stock: insumo.stock,
                stock_base: insumo.stock,
                incremento: ''
            });
        } else {
            setInsumoForm({
                id: null,
                nombre: '',
                stock: '',
                stock_base: 0,
                incremento: ''
            });
        }
        setIsAddInsumoModalOpen(true);
    };

    const handleSaveInsumo = async () => {
        if (!insumoForm.nombre.trim() || insumoForm.stock === '') {
            showSystemToast('Por favor ingresa el nombre y el stock del insumo.');
            return;
        }
        setInsumoFormLoading(true);
        try {
            if (insumoForm.id) {
                const payload = {
                    nombre: insumoForm.nombre,
                };
                if (insumoForm.incremento && parseInt(insumoForm.incremento) > 0) {
                    payload.cantidad_llegada = parseInt(insumoForm.incremento);
                } else {
                    payload.stock = parseInt(insumoForm.stock);
                }
                await api.put(`/odontologia/catalogo-insumos/${insumoForm.id}`, payload);
                showSystemToast('Insumo actualizado correctamente.');
            } else {
                await api.post('/odontologia/catalogo-insumos', {
                    nombre: insumoForm.nombre,
                    stock: parseInt(insumoForm.stock)
                });
                showSystemToast('Insumo agregado al catálogo.');
            }
            setIsAddInsumoModalOpen(false);
            fetchCatalogoInsumos();
        } catch (err) {
            console.error('Error al guardar insumo:', err);
            const msg = err.response?.data?.message || 'Error al guardar el insumo.';
            showSystemToast(msg);
        } finally {
            setInsumoFormLoading(false);
        }
    };

    const handleDeleteInsumo = (id) => {
        setConfirmModal({
            show: true,
            title: 'Eliminar Insumo del Catálogo',
            message: '¿Estás seguro de que deseas eliminar este insumo del catálogo? Esta acción no se puede deshacer.',
            onConfirm: async () => {
                try {
                    await api.delete(`/odontologia/catalogo-insumos/${id}`);
                    showSystemToast('Insumo eliminado del catálogo.');
                    fetchCatalogoInsumos();
                } catch (err) {
                    console.error('Error al eliminar insumo:', err);
                    showSystemToast('Error al eliminar el insumo.');
                }
            }
        });
    };

    const handleOpenQuickStockModal = (insumo, type) => {
        setQuickStockTarget(insumo);
        setQuickStockType(type);
        setQuickStockAmount(1);
        setIsQuickStockModalOpen(true);
    };

    const handleSaveQuickStock = async (e) => {
        if (e) e.preventDefault();
        if (!quickStockTarget || !quickStockAmount || parseInt(quickStockAmount) <= 0) {
            showSystemToast('Por favor ingrese una cantidad válida.');
            return;
        }
        setQuickStockLoading(true);
        try {
            const qty = parseInt(quickStockAmount);
            let newStock = quickStockTarget.stock || 0;
            const payload = { nombre: quickStockTarget.nombre };
            if (quickStockType === 'add') {
                payload.cantidad_llegada = qty;
            } else {
                newStock = Math.max(0, newStock - qty);
                payload.stock = newStock;
            }
            await api.put(`/odontologia/catalogo-insumos/${quickStockTarget.id}`, payload);
            showSystemToast(quickStockType === 'add' ? `Se ingresaron ${qty} unidades de "${quickStockTarget.nombre}".` : `Se descontaron ${qty} unidades de "${quickStockTarget.nombre}".`);
            setIsQuickStockModalOpen(false);
            fetchCatalogoInsumos();
        } catch (err) {
            console.error('Error al ajustar stock:', err);
            showSystemToast('Error al actualizar existencias del insumo.');
        } finally {
            setQuickStockLoading(false);
        }
    };

    const handleInsumoPatientSearch = async (val) => {
        const queryVal = typeof val === 'string' ? val : insumoPatientSearch;
        if (typeof val === 'string') {
            setInsumoPatientSearch(val);
        }

        const q = queryVal.trim();
        if (!q) {
            setInsumoPatientResults([]);
            return;
        }
        setInsumoPatientSearchLoading(true);
        try {
            const res = await api.get('/users/search-by-cedula', { params: { cedula: q } });
            const data = res.data.data;
            if (Array.isArray(data)) {
                setInsumoPatientResults(data);
            } else if (data) {
                setInsumoPatientResults([data]);
            } else {
                setInsumoPatientResults([]);
            }
        } catch (err) {
            setInsumoPatientResults([]);
        } finally {
            setInsumoPatientSearchLoading(false);
        }
    };

    const handleOpenAssignInsumo = () => {
        setInsumoSelectedPatient(selectedPatient || null);
        setConsumoForm({
            id_usuario_paciente: selectedPatient?.id_usuario || selectedPatient?.id || '',
            id_insumo: insumosCatalogo.length > 0 ? insumosCatalogo[0].id : '',
            cantidad_gastada: '1'
        });
        setInsumoPatientSearch('');
        setInsumoPatientResults([]);
        setIsAssignInsumoModalOpen(true);
    };

    const handleSaveConsumo = async () => {
        if (!consumoForm.id_usuario_paciente || !consumoForm.id_insumo || !consumoForm.cantidad_gastada.trim()) {
            showSystemToast('Completa todos los campos para registrar el consumo.');
            return;
        }
        setConsumoFormLoading(true);
        try {
            await api.post('/odontologia/insumos-paciente', {
                id_usuario_paciente: consumoForm.id_usuario_paciente,
                id_insumo: parseInt(consumoForm.id_insumo),
                cantidad_gastada: consumoForm.cantidad_gastada
            });
            showSystemToast('Consumo registrado. El stock se actualizó automáticamente.');
            setIsAssignInsumoModalOpen(false);
            fetchCatalogoInsumos();
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al registrar consumo.';
            showSystemToast(msg);
            console.error('Error al registrar consumo:', err);
        } finally {
            setConsumoFormLoading(false);
        }
    };

    const handleSaveInlineConsumo = async (e) => {
        if (e) e.preventDefault();
        const patientId = selectedPatient?.id_usuario || selectedPatient?.id;
        if (!patientId || !inlineInsumoForm.id_insumo || !inlineInsumoForm.cantidad_gastada.trim()) {
            showSystemToast('Selecciona un insumo e ingresa la cantidad consumida.');
            return;
        }
        setInlineInsumoLoading(true);
        try {
            const insumoRes = await api.post('/odontologia/insumos-paciente', {
                id_usuario_paciente: patientId,
                id_insumo: parseInt(inlineInsumoForm.id_insumo),
                cantidad_gastada: inlineInsumoForm.cantidad_gastada
            });
            const createdInsumo = insumoRes.data?.data || insumoRes.data;
            if (createdInsumo?.id) {
                setSessionInsumoIds(prev => [...prev, createdInsumo.id]);
            }
            showSystemToast('Insumo registrado. El inventario se actualizó automáticamente.');
            setInlineInsumoForm({ id_insumo: '', cantidad_gastada: '1' });
            fetchCatalogoInsumos();
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al registrar consumo.';
            showSystemToast(msg);
            console.error('Error al registrar consumo inline:', err);
        } finally {
            setInlineInsumoLoading(false);
        }
    };

    const handleDeleteConsumo = (id) => {
        setConfirmModal({
            show: true,
            title: 'Eliminar Registro de Consumo',
            message: '¿Estás seguro de que deseas eliminar este registro de consumo?',
            onConfirm: async () => {
                try {
                    await api.delete(`/odontologia/insumos-paciente/${id}`);
                    showSystemToast('Registro de consumo eliminado.');
                    fetchCatalogoInsumos();
                } catch (err) {
                    console.error('Error al eliminar consumo:', err);
                    showSystemToast('Error al eliminar el registro.');
                }
            }
        });
    };

    // ==========================================
    // CONTROLADORES DE API - EVOLUCIÓN / TRATAMIENTOS
    // ==========================================
    const fetchEvoluciones = async (patientId) => {
        setEvolucionLoading(true);
        try {
            const res = await api.get('/odontologia/historial-evolucion', {
                params: { id_usuario_paciente: patientId }
            }).catch(() => ({ data: { data: [] } }));
            setEvolucionList(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setEvolucionLoading(false);
        }
    };

    const fetchPatientHistoryByArea = async (patientId) => {
        setAreaHistoriesLoading(true);
        try {
            const [evolRes, diarioRes] = await Promise.all([
                api.get('/odontologia/historial-evolucion', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/parte-diario-odontologia', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } }))
            ]);
            const mappedEvol = (evolRes.data.data || []).map(item => ({
                ...item,
                type: 'evolucion',
                recordTitle: `Evolución Dental`,
                fecha: item.fecha ? item.fecha.slice(0, 10) : '',
                detalle_evolucion: item.detalle_tratamiento || item.observaciones
            }));
            const mappedDiario = (diarioRes.data.data || []).map(item => ({
                ...item,
                type: 'diario',
                recordTitle: 'Atención Diario Odontología',
                fecha: item.fecha ? item.fecha.slice(0, 10) : ''
            }));
            const combined = [...mappedEvol, ...mappedDiario].sort((a, b) => b.fecha.localeCompare(a.fecha));
            setAreaHistories({ odontologia: combined });
        } catch (err) {
            console.error("Error al cargar historial por área:", err);
        } finally {
            setAreaHistoriesLoading(false);
        }
    };

    const handleSaveEvolucion = async (e) => {
        e.preventDefault();
        if (!selectedPatient || !evolucionForm.detalle_tratamiento.trim()) return;

        try {
            await api.post('/odontologia/historial-evolucion', {
                id_usuario_paciente: selectedPatient.id_usuario,
                fecha: evolucionForm.fecha,
                detalle_tratamiento: evolucionForm.detalle_tratamiento,
                detalle_procedimiento: evolucionForm.detalle_procedimiento,
                prescripción_farmaceutica: evolucionForm.prescripción_farmaceutica
            });

            // Registrar parte diario automático
            const today = getLocalDateString();
            const dailyPayload = {
                id_usuario_paciente: selectedPatient.id_usuario,
                fecha: today,
                tipo_atencion: 'secundaria',
                tipo_atencion2: 'curativo',
                detalle_diagnostico: `Sesión de evolución: ${evolucionForm.detalle_tratamiento}`,
                procedimiento: 'Profilaxis'
            };

            await api.post('/odontologia/parte-diario-odontologia', dailyPayload).catch(() => { });

            showSystemToast("Sesión de evolución registrada con éxito.");
            setEvolucionForm(prev => ({ ...prev, detalle_tratamiento: '', prescripción_farmaceutica: 'Ninguna' }));
            fetchEvoluciones(selectedPatient.id_usuario);
        } catch (err) {
            console.error(err);
            showSystemToast("Error al guardar la evolución dental.");
        }
    };

    // ==========================================
    // CONTROLADORES DE API - HISTORIAL GENERAL
    // ==========================================
    const fetchHistorialGeneral = async () => {
        try {
            const [evolucionRes, diarioRes] = await Promise.all([
                api.get('/odontologia/historial-evolucion').catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/parte-diario-odontologia').catch(() => ({ data: { data: [] } }))
            ]);

            const mappedEvolucion = (evolucionRes?.data?.data || [])
                .filter(item => item && typeof item === 'object')
                .map(item => ({
                    id: `evolucion-${item.id}`,
                    type: 'evolucion',
                    fecha: item.fecha ? item.fecha.slice(0, 10) : '',
                    paciente: item.paciente,
                    detalle: `Tratamiento: ${item.detalle_tratamiento || 'N/D'} · Procedimiento: ${item.detalle_procedimiento || 'N/D'}`
                }));

            const mappedDiario = (diarioRes?.data?.data || [])
                .filter(item => item && typeof item === 'object')
                .map(item => ({
                    id: `diario-${item.id}`,
                    type: 'diario',
                    fecha: item.fecha ? item.fecha.slice(0, 10) : '',
                    paciente: item.paciente,
                    detalle: `Atención: ${(item.tipo_atencion || 'N/D').toUpperCase()} · Diagnóstico: ${item.detalle_diagnostico || 'N/D'} · Procedimiento: ${item.procedimiento || 'N/D'}`
                }));

            setHistorialList([...mappedEvolucion, ...mappedDiario]);
        } catch (err) {
            console.error(err);
        }
    };

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
            const pIdent = cita.paciente?.datos_identificacion || cita.paciente?.datosIdentificacion || {};
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
                <title>Reporte de Citas de Odontología - ${formattedFecha}</title>
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
                            <div style="width: 80px;"></div>
                            <div class="header-title">
                                <h1>Universidad Estatal de Bolívar</h1>
                                <h2>Bienestar Estudiantil</h2>
                                <h3>Reporte de Citas de Odontología</h3>
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
                            <p style="margin: 2px 0 0; font-size: 8.5px; color: #64748b;">Odontólogo/a</p>
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
        if (activeTab === 'historial') {
            if (activeReportSubTab === 'diario') {
                fetchParteDiario();
            } else if (activeReportSubTab === 'insumos') {
                if (reportInsumosFecha) {
                    const parts = reportInsumosFecha.split('-');
                    const y = parseInt(parts[0]);
                    const m = parseInt(parts[1]);
                    setReportMonth(m);
                    setReportYear(y);
                }
                fetchCatalogoInsumos();
                fetchAllParteDiarioForReport();
            } else if (activeReportSubTab === 'citas') {
                fetchReportCitas();
            } else if (activeReportSubTab === 'mensual') {
                let m = genReportMonth;
                let y = genReportYear;
                if (reportMensualFecha) {
                    const parts = reportMensualFecha.split('-');
                    y = parseInt(parts[0]);
                    m = parseInt(parts[1]);
                    setGenReportMonth(m);
                    setGenReportYear(y);
                }
                fetchAndCompileGeneralReport(m, y);
            }
        }
    }, [activeTab, activeReportSubTab, parteDiarioDate, reportInsumosFecha, reportCitasFecha, reportCitasEstado, reportMensualFecha]);

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
            showSystemToast(err.response?.data?.message || "Error al confirmar la cita");
        }
    };

    const handleCancelarCita = (citaId) => {
        setConfirmModal({
            show: true,
            title: 'Cancelar Cita Odontológica',
            message: '¿Estás seguro de que deseas cancelar esta cita? El horario de atención quedará disponible para otros usuarios.',
            onConfirm: async () => {
                try {
                    await api.patch(`/citas-medicas/${citaId}/cancelar`);
                    fetchCitasDoctor();
                    showSystemToast("Cita cancelada exitosamente");
                } catch (err) {
                    showSystemToast(err.response?.data?.message || "Error al cancelar la cita");
                }
            }
        });
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
            showSystemToast("Cita completada y notas guardadas exitosamente");
        } catch (err) {
            showSystemToast(err.response?.data?.message || "Error al completar la cita");
        } finally {
            setSavingNotas(false);
        }
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
                const pIdent = cita.paciente?.datos_identificacion || cita.paciente?.datosIdentificacion;
                const patientName = pIdent
                    ? `${pIdent.primer_nombre} ${pIdent.segundo_nombre || ''} ${pIdent.apellido_paterno} ${pIdent.apellido_materno || ''}`.replace(/\s+/g, ' ').trim()
                    : cita.paciente?.name || 'Paciente';
                const cedula = pIdent?.numero_cedula || 'N/D';
                const estado = (cita.estado || 'programada').toUpperCase();
                const horario = `${cita.hora_inicio || ''} - ${cita.hora_fin || ''}`;
                const motivo = cita.motivo || 'Consulta en Odontología';
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
                    <title>Reporte de Citas Médicas - Odontología UEB</title>
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
                                <h3 style="margin: 2px 0 0; font-size: 10px; font-weight: bold; color: #b71a34;">REPORTE DE CITAS Y CONSULTAS - ODONTOLOGÍA</h3>
                            </div>
                            <div style="text-align: right; font-size: 9px;">
                                <strong>FECHA FILTRO:</strong><br/>${formattedDate}
                            </div>
                        </div>

                        <div class="meta-info">
                            <div><strong>Odontólogo/a Responsable:</strong> ${doctorNameText}</div>
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
                                <strong>Odontólogo/a Responsable</strong><br/>
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
            const pIdent = item.paciente?.datos_identificacion || item.paciente?.datosIdentificacion;
            const patientName = (pIdent
                ? `${pIdent.primer_nombre} ${pIdent.apellido_paterno}`
                : item.paciente?.name || ''
            ).toLowerCase();
            const patientCedula = pIdent?.numero_cedula || '';
            const details = (item.detalle || '').toLowerCase();

            if (searchText && !patientName.includes(searchText) && !patientCedula.includes(searchText) && !details.includes(searchText)) {
                return false;
            }

            if (historialDate && item.fecha && item.fecha.slice(0, 10) !== historialDate) return false;

            return true;
        });
    };

    // Componente Diente SVG
    const ToothSvg = ({ toothNum }) => {
        const tState = odontogramaState[toothNum] || { top: 'sano', bottom: 'sano', left: 'sano', right: 'sano', center: 'sano', ausente: false };

        const getFaceColor = (faceState) => {
            if (!faceState || faceState === 'sano') return '#ffffff';
            const stateObj = odontogramaEstados.find(e =>
                String(e.id) === String(faceState) ||
                e.nombre.toLowerCase() === String(faceState).toLowerCase()
            );
            return stateObj ? stateObj.color : '#ffffff';
        };

        return (
            <div className={`tooth-item ${tState.ausente ? 'ausente' : ''} ${selectedPatient ? '' : 'disabled'}`}>
                <span className="tooth-number">{toothNum}</span>
                <svg viewBox="0 0 100 100" className="tooth-svg">
                    {/* Cara Superior / Vestibular (Top) */}
                    <polygon
                        points="0,0 100,0 75,25 25,25"
                        className="tooth-face"
                        style={{ fill: getFaceColor(tState.top) }}
                        onClick={() => selectedPatient && handleToothClick(toothNum, 'top')}
                    />
                    {/* Cara Derecha / Distal o Mesial (Right) */}
                    <polygon
                        points="100,0 100,100 75,75 75,25"
                        className="tooth-face"
                        style={{ fill: getFaceColor(tState.right) }}
                        onClick={() => selectedPatient && handleToothClick(toothNum, 'right')}
                    />
                    {/* Cara Inferior / Lingual (Bottom) */}
                    <polygon
                        points="0,100 100,100 75,75 25,75"
                        className="tooth-face"
                        style={{ fill: getFaceColor(tState.bottom) }}
                        onClick={() => selectedPatient && handleToothClick(toothNum, 'bottom')}
                    />
                    {/* Cara Izquierda / Mesial o Distal (Left) */}
                    <polygon
                        points="0,0 0,100 25,75 25,25"
                        className="tooth-face"
                        style={{ fill: getFaceColor(tState.left) }}
                        onClick={() => selectedPatient && handleToothClick(toothNum, 'left')}
                    />
                    {/* Cara Centro / Oclusal (Center) */}
                    <polygon
                        points="25,25 75,25 75,75 25,75"
                        className="tooth-face"
                        style={{ fill: getFaceColor(tState.center) }}
                        onClick={() => selectedPatient && handleToothClick(toothNum, 'center')}
                    />
                </svg>
                {tState.ausente && (
                    <div style={{ fontSize: '8px', color: '#ef4444', fontWeight: 'bold', marginTop: '2px' }}>
                        AUSENTE
                    </div>
                )}
            </div>
        );
    };

    const handleDownloadHistoriaClinicaPdf = async (patientId, targetDate) => {
        showSystemToast("Generando reporte imprimible...");
        const actualPatientId = patientId || selectedPatient?.id_usuario || selectedPatient?.id;
        try {
            // 1. Fetch complete profile and history lists
            const [
                profileRes,
                motivoRes,
                examenRes,
                periodontalRes,
                evolucionRes,
                odontogramaRes
            ] = await Promise.all([
                api.get(`/odontologia/pacientes/${actualPatientId}/perfil`),
                api.get('/odontologia/motivo-consulta', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/examen', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/enfermedad-periodontal', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/historial-evolucion', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get(`/odontologia/odontograma-paciente/${actualPatientId}`).catch(() => ({ data: { data: null } }))
            ]);

            const patient = profileRes.data.data;
            const ident = patient.datos_identificacion || {};
            const dirs = patient.direcciones || [];

            const dirProcedencia = dirs.find(d => d.id_tipo_direccion === 1) || dirs[0] || {};
            const dirResidencia = dirs.find(d => d.id_tipo_direccion === 2) || dirs[0] || {};
            const dirNacimiento = dirs.find(d => d.id_tipo_direccion === 3) || {};

            const lugarNacimientoStr = dirNacimiento.provincia
                ? `${dirNacimiento.canton?.nombre_canton || dirNacimiento.canton?.nombre || ''}, ${dirNacimiento.provincia?.nombre_provincia || dirNacimiento.provincia?.nombre || ''}`.replace(/^,\s*|,\s*$/g, '')
                : (dirResidencia.nacionalidad || 'Ecuador');

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
            const examenes = dateStr ? examenRes.data.data.filter(ex => (ex.created_at || '').slice(0, 10) === dateStr) : examenRes.data.data;
            const periodontales = dateStr ? periodontalRes.data.data.filter(p => (p.created_at || '').slice(0, 10) === dateStr) : periodontalRes.data.data;
            const evoluciones = dateStr ? evolucionRes.data.data.filter(ev => (ev.fecha || ev.created_at || '').slice(0, 10) === dateStr) : evolucionRes.data.data;
            const odData = odontogramaRes?.data?.data || null;

            // Map odontograma state
            const teethState = {};
            const upperRightTeeth = [18, 17, 16, 15, 14, 13, 12, 11];
            const upperLeftTeeth = [21, 22, 23, 24, 25, 26, 27, 28];
            const lowerLeftTeeth = [31, 32, 33, 34, 35, 36, 37, 38];
            const lowerRightTeeth = [48, 47, 46, 45, 44, 43, 42, 41];
            const allTeeth = [...upperRightTeeth, ...upperLeftTeeth, ...lowerLeftTeeth, ...lowerRightTeeth];

            allTeeth.forEach(num => {
                teethState[num] = { top: 'sano', bottom: 'sano', left: 'sano', right: 'sano', center: 'sano', ausente: false };
            });

            if (odData && odData.asignaciones && odData.asignaciones.length > 0) {
                odData.asignaciones.forEach(assign => {
                    const universalNum = assign.pieza ? assign.pieza.numero_pieza_dental : null;
                    if (!universalNum) return;

                    const fdiNum = Object.keys(fdiToUniversal).find(
                        key => String(fdiToUniversal[key]) === String(universalNum)
                    );
                    if (!fdiNum) return;

                    const stateObj = odontogramaEstados.find(e => e.id === assign.id_estado);
                    const stateName = stateObj ? stateObj.nombre.toLowerCase() : 'sano';

                    if (assign.id_numero_carilla === null) {
                        if (stateName === 'ausente') {
                            teethState[fdiNum].ausente = true;
                        }
                    } else {
                        const carillaName = assign.carilla ? assign.carilla.numero_carilla.toLowerCase() : '';
                        const face = getSvgFaceName(fdiNum, carillaName);
                        if (face && teethState[fdiNum]) {
                            teethState[fdiNum][face] = assign.id_estado;
                        }
                    }
                });
            }

            // Helper to render tooth SVG
            const getToothColor = (state) => {
                if (!state || state === 'sano') return '#ffffff';
                const stateObj = odontogramaEstados.find(e =>
                    String(e.id) === String(state) ||
                    e.nombre.toLowerCase() === String(state).toLowerCase()
                );
                return stateObj ? stateObj.color : '#ffffff';
            };

            const renderToothSvgHtml = (num) => {
                const t = teethState[num];
                const topVal = getToothColor(t.top);
                const rightVal = getToothColor(t.right);
                const bottomVal = getToothColor(t.bottom);
                const leftVal = getToothColor(t.left);
                const centerVal = getToothColor(t.center);
                const isAus = t.ausente;

                return `
                    <div style="display: flex; flex-direction: column; align-items: center; width: 32px; padding: 4px 2px; border: 1px solid #cbd5e1; border-radius: 4px; background: ${isAus ? '#f1f5f9' : '#ffffff'}; opacity: ${isAus ? 0.6 : 1}; margin: 2px;">
                        <span style="font-size: 8px; font-weight: bold; margin-bottom: 2px; color: #475569;">${num}</span>
                        <svg viewBox="0 0 100 100" style="width: 20px; height: 20px;">
                            <polygon points="0,0 100,0 75,25 25,25" fill="${topVal}" stroke="#64748b" stroke-width="2" />
                            <polygon points="100,0 100,100 75,75 75,25" fill="${rightVal}" stroke="#64748b" stroke-width="2" />
                            <polygon points="0,100 100,100 75,75 25,75" fill="${bottomVal}" stroke="#64748b" stroke-width="2" />
                            <polygon points="0,0 0,100 25,75 25,25" fill="${leftVal}" stroke="#64748b" stroke-width="2" />
                            <polygon points="25,25 75,25 75,75 25,75" fill="${centerVal}" stroke="#64748b" stroke-width="2" />
                        </svg>
                        ${isAus ? '<div style="font-size: 5px; color: #ef4444; font-weight: bold; margin-top: 1px;">AUS</div>' : ''}
                    </div>
                `;
            };

            // Latest Ficha Examen and Periodontal
            const activeExamen = examenes[0] || {};
            const activePeriodontal = periodontales[0] || {};

            // 2. Generate HTML layout matching the dentist printable sheet
            const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Historia Clínica Odontológica</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm;
        }
        * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            margin: 0;
            padding: 20px;
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
            padding: 6px 8px;
            border: 1px solid #000000;
            font-size: 10px;
            text-transform: uppercase;
            margin-top: 15px;
            text-align: center;
        }
        .odontograma-block {
            border: 1px solid #000000;
            padding: 12px;
            background: #ffffff;
            margin-bottom: 10px;
        }
        .odontograma-print-row {
            display: flex;
            justify-content: center;
            margin-bottom: 10px;
        }
        @media screen {
            body {
                background-color: #e8edf2;
                padding: 30px 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .page-sheet {
                width: 210mm;
                max-width: 100%;
                box-shadow: 0 8px 24px rgba(0,0,0,0.18);
                border-radius: 6px;
                margin-bottom: 30px;
            }
        }
        @media print {
            body {
                background-color: transparent !important;
                padding: 0 !important;
                margin: 0 !important;
                display: block !important;
            }
            .page-sheet {
                width: 100% !important;
                min-height: auto !important;
                padding: 0 !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                margin-bottom: 0 !important;
                background-color: transparent !important;
            }
            .no-print {
                display: none !important;
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
            <td class="form-value text-center">${lugarNacimientoStr}</td>
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

    <div class="page-break"></div>

    <!-- PAGINA 2: HISTORIA CLÍNICA ODONTOLÓGICA -->
    <table class="header-table">
        <tr>
            <td class="header-title">Historia Clínica Odontológica</td>
            <td class="header-logo-container">
                <div style="font-weight: bold; font-size: 12px; color: #b71a34; line-height: 1.1;">BIENESTAR</div>
                <div style="font-size: 9px; color: #002040; letter-spacing: 0.5px;">UNIVERSITARIO</div>
            </td>
        </tr>
    </table>

    <table class="data-table">
        ${motivos.length > 0 ? motivos.map(m => `
            <tr>
                <td class="form-label" style="width: 25%;">Motivo de la consulta</td>
                <td colspan="5" class="form-value">${m.detalle_motivo}</td>
            </tr>
            <tr>
                <td class="form-label">Última visita Odontólogo</td>
                <td colspan="5" class="form-value">${m.ultima_visita_fecha || '—'}</td>
            </tr>
            <tr>
                <td class="form-label">¿Está en tratamiento?</td>
                <td style="width: 8%; text-align: center;">${m.algun_tratamiento === 'si' ? 'SI (X)' : 'SI ( )'}</td>
                <td style="width: 8%; text-align: center;">${m.algun_tratamiento !== 'si' ? 'NO (X)' : 'NO ( )'}</td>
                <td class="form-label" style="width: 20%;">Especifique</td>
                <td colspan="2" class="form-value">${m.algun_tratamiento === 'si' ? m.detalle_tratamiento : '—'}</td>
            </tr>
            <tr>
                <td class="form-label">¿Toma algún medicamento?</td>
                <td style="text-align: center;">${m.algun_medicamento === 'si' ? 'SI (X)' : 'SI ( )'}</td>
                <td style="text-align: center;">${m.algun_medicamento !== 'si' ? 'NO (X)' : 'NO ( )'}</td>
                <td class="form-label">Especifique</td>
                <td colspan="2" class="form-value">${m.algun_medicamento === 'si' ? m.detalle_medicamento : '—'}</td>
            </tr>
        `).join('') : `
            <tr><td colspan="6" class="text-center">Sin antecedentes de motivo de consulta.</td></tr>
        `}
    </table>

    <div class="clinical-history-section-header">Examen Intra-Bucal y Extra-Bucal</div>
    <table class="data-table">
        <thead>
            <tr class="form-label">
                <th style="width: 25%;">TIPO</th>
                <th style="width: 12.5%;">NORMAL</th>
                <th style="width: 12.5%;">ANORMAL</th>
                <th style="width: 25%;">TIPO</th>
                <th style="width: 12.5%;">NORMAL</th>
                <th style="width: 12.5%;">ANORMAL</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="font-weight: bold; background-color: #f8fafc;">PIEL</td>
                <td class="text-center">${activeExamen.piel === 'normal' ? 'X' : ''}</td>
                <td class="text-center">${activeExamen.piel === 'anormal' ? 'X' : ''}</td>
                <td style="font-weight: bold; background-color: #f8fafc;">GLÁNDULAS SALIVALES</td>
                <td class="text-center">${activeExamen.glándulas_salivales === 'normal' ? 'X' : ''}</td>
                <td class="text-center">${activeExamen.glándulas_salivales === 'anormal' ? 'X' : ''}</td>
            </tr>
            <tr>
                <td style="font-weight: bold; background-color: #f8fafc;">LABIOS</td>
                <td class="text-center">${activeExamen.labios === 'normal' ? 'X' : ''}</td>
                <td class="text-center">${activeExamen.labios === 'anormal' ? 'X' : ''}</td>
                <td style="font-weight: bold; background-color: #f8fafc;">GANGLIOS</td>
                <td class="text-center">${activeExamen.ganglios === 'normal' ? 'X' : ''}</td>
                <td class="text-center">${activeExamen.ganglios === 'anormal' ? 'X' : ''}</td>
            </tr>
            <tr>
                <td style="font-weight: bold; background-color: #f8fafc;">CARRILLOS</td>
                <td class="text-center">${activeExamen.carrillos === 'normal' ? 'X' : ''}</td>
                <td class="text-center">${activeExamen.carrillos === 'anormal' ? 'X' : ''}</td>
                <td style="font-weight: bold; background-color: #f8fafc;">TEJIDO MUSCULAR</td>
                <td class="text-center">${activeExamen.tejido_muscular === 'normal' ? 'X' : ''}</td>
                <td class="text-center">${activeExamen.tejido_muscular === 'anormal' ? 'X' : ''}</td>
            </tr>
            <tr>
                <td style="font-weight: bold; background-color: #f8fafc;">PALADAR</td>
                <td class="text-center">${activeExamen.paladar === 'normal' ? 'X' : ''}</td>
                <td class="text-center">${activeExamen.paladar === 'anormal' ? 'X' : ''}</td>
                <td style="font-weight: bold; background-color: #f8fafc;">ATM</td>
                <td class="text-center">${activeExamen.atm === 'normal' ? 'X' : ''}</td>
                <td class="text-center">${activeExamen.atm === 'anormal' ? 'X' : ''}</td>
            </tr>
            <tr>
                <td style="font-weight: bold; background-color: #f8fafc;">PISO DE LA BOCA</td>
                <td class="text-center">${activeExamen.piso_de_la_boca === 'normal' ? 'X' : ''}</td>
                <td class="text-center">${activeExamen.piso_de_la_boca === 'anormal' ? 'X' : ''}</td>
                <td style="font-weight: bold; background-color: #f8fafc;">MAXILAR SUPERIOR</td>
                <td class="text-center">${activeExamen.maxilar_superior === 'normal' ? 'X' : ''}</td>
                <td class="text-center">${activeExamen.maxilar_superior === 'anormal' ? 'X' : ''}</td>
            </tr>
            <tr>
                <td style="font-weight: bold; background-color: #f8fafc;">LENGUA</td>
                <td class="text-center">${activeExamen.lengua === 'normal' ? 'X' : ''}</td>
                <td class="text-center">${activeExamen.lengua === 'anormal' ? 'X' : ''}</td>
                <td style="font-weight: bold; background-color: #f8fafc;">MAXILAR INFERIOR</td>
                <td class="text-center">${activeExamen.maxilar_inferior === 'normal' ? 'X' : ''}</td>
                <td class="text-center">${activeExamen.maxilar_inferior === 'anormal' ? 'X' : ''}</td>
            </tr>
            <tr>
                <td class="form-label">OBSERVACIONES</td>
                <td colspan="5" style="height: 30px; padding: 6px; vertical-align: top;">${activeExamen.observaciones || 'Sin observaciones.'}</td>
            </tr>
        </tbody>
    </table>

    <div class="clinical-history-section-header">Odontograma</div>
    <div class="odontograma-block">
        <div style="font-size: 8px; font-weight: bold; color: #475569; margin-bottom: 8px; text-align: center;">PIEZAS DENTALES (ADULTO)</div>
        <div class="odontograma-print-row">
            ${upperRightTeeth.map(num => renderToothSvgHtml(num)).join('')}
            <div style="width: 2px; background: #cbd5e1; margin: 0 8px;"></div>
            ${upperLeftTeeth.map(num => renderToothSvgHtml(num)).join('')}
        </div>
        <div class="odontograma-print-row" style="margin-top: 15px;">
            ${lowerRightTeeth.map(num => renderToothSvgHtml(num)).join('')}
            <div style="width: 2px; background: #cbd5e1; margin: 0 8px;"></div>
            ${lowerLeftTeeth.map(num => renderToothSvgHtml(num)).join('')}
        </div>
        <div style="display: flex; justify-content: center; gap: 15px; font-size: 8px; margin-top: 15px; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
            <div><span style="display:inline-block; width:10px; height:10px; background:#ffffff; border:1px solid #64748b; margin-right:4px; vertical-align:middle;"></span>Sano</div>
            ${odontogramaEstados.map(e => `
                <div><span style="display:inline-block; width:10px; height:10px; background:${e.color}; border:1px solid #000; margin-right:4px; vertical-align:middle;"></span>${e.nombre}</div>
            `).join('')}
        </div>
    </div>

    <table class="data-table" style="width: 250px; margin: 15px auto 0 auto;">
        <thead>
            <tr class="form-label">
                <th colspan="3">PERIODONTAL</th>
            </tr>
            <tr class="form-label">
                <th>TIPO</th>
                <th>SI</th>
                <th>NO</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="font-weight: bold;">Placa Bacteriana</td>
                <td class="text-center">${activePeriodontal.placa_bacteriana === 'si' ? 'X' : ''}</td>
                <td class="text-center">${activePeriodontal.placa_bacteriana !== 'si' ? 'X' : ''}</td>
            </tr>
            <tr>
                <td style="font-weight: bold;">Cálculos Dentales</td>
                <td class="text-center">${activePeriodontal.calculos_dentales === 'si' ? 'X' : ''}</td>
                <td class="text-center">${activePeriodontal.calculos_dentales !== 'si' ? 'X' : ''}</td>
            </tr>
            <tr>
                <td style="font-weight: bold;">Bolsa Periodontal</td>
                <td class="text-center">${activePeriodontal.bolsa_periodontal === 'si' ? 'X' : ''}</td>
                <td class="text-center">${activePeriodontal.bolsa_periodontal !== 'si' ? 'X' : ''}</td>
            </tr>
            <tr>
                <td style="font-weight: bold;">Movilidad Dental</td>
                <td class="text-center">${activePeriodontal.movilidad_dental === 'si' ? 'X' : ''}</td>
                <td class="text-center">${activePeriodontal.movilidad_dental !== 'si' ? 'X' : ''}</td>
            </tr>
        </tbody>
    </table>

    <div class="page-break"></div>

    <!-- PAGINA 3: HOJA DE EVOLUCIÓN ODONTOLOGÍA -->
    <table class="header-table">
        <tr>
            <td class="header-title">Hoja de Evolución Odontológica</td>
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
                <th style="width: 50%;">Tratamiento / Procedimientos</th>
                <th style="width: 35%;">Prescripción Farmacéutica</th>
            </tr>
        </thead>
        <tbody>
            ${evoluciones.length > 0 ? evoluciones.map(ev => `
                <tr style="font-size: 10px; vertical-align: top;">
                    <td class="text-center" style="padding: 10px 5px;">${ev.fecha || (ev.created_at ? ev.created_at.slice(0, 10) : '')}</td>
                    <td style="padding: 10px;">
                        <strong>Tratamiento:</strong> ${ev.detalle_tratamiento}<br/>
                        <strong>Procedimiento:</strong> ${ev.detalle_procedimiento}
                    </td>
                    <td style="padding: 10px;">${ev.prescripcion_medica || 'Sin prescripción.'}</td>
                </tr>
            `).join('') : '<tr><td colspan="3" class="text-center" style="padding: 20px;">Sin evoluciones registradas.</td></tr>'}
        </tbody>
    </table>

    </div>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 300);
        };
    </script>
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
                            <Stethoscope size={20} color="white" />
                        </div>
                        <div className="brand__text">
                            <strong>Sección</strong>
                            <span>Odontología</span>
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
                            className={`navigation__item ${activeTab === 'insumos' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('insumos'); setIsSidebarOpen(false); }}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><Package size={18} /></span>
                            <span className="navigation__text">Insumos Médicos</span>
                        </button>
                        <button
                            className={`navigation__item ${activeTab === 'procedimientos' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('procedimientos'); setIsSidebarOpen(false); }}
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
                        <p className="system-version">Sistema BU · Odontología</p>
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
                                <p className="breadcrumb">Odontología / <span>{activeTab === 'historial' ? 'REPORTES' : activeTab.toUpperCase()}</span></p>
                                <h1>
                                    {activeTab === 'ficha' ? 'Ficha Clínica Odontológica' :
                                        activeTab === 'odontograma' ? 'Odontograma Interactivo' :
                                            activeTab === 'diario' ? 'Parte Diario de Odontología' :
                                                activeTab === 'evolucion' ? 'Evolución y Tratamientos' :
                                                    activeTab === 'insumos' ? 'Insumos Médicos' : 'Reportes'}
                                </h1>
                            </div>
                        </div>
                        <div className="topbar__right">
                            <button className="topbar-button" style={{ marginRight: '8px' }}><Bell size={18} /><span className="notification-point"></span></button>
                            <UserProfileMenu />
                        </div>
                    </header>

                    <div className="content">
                        {/* PESTAÑA 1: FICHA CLINICA & ANAMNESIS (Hero + Grid cuando no hay paciente) */}
                        {activeTab === 'ficha' && (
                            <div>
                                <section className="page-hero vitals-choice-hero">
                                    <div>
                                        <span className="page-hero__label"><Stethoscope size={14} style={{ marginRight: '6px', display: 'inline' }} /> Atención clínica</span>
                                        <h2>¿Qué deseas realizar?</h2>
                                        <p>Selecciona una acción para iniciar la atención o registrar la ficha clínica de un paciente nuevo.</p>
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

                                    <button
                                        className="vitals-action-card vitals-action-card--secondary"
                                        onClick={() => {
                                            setActiveTab('odontograma');
                                        }}
                                    >
                                        <span className="vitals-action-card__glow" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)' }}></span>
                                        <span className="vitals-action-card__icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><Activity size={24} /></span>
                                        <span className="vitals-action-card__content">
                                            <small>Revisar y Asignar</small>
                                            <strong>Revisar odontograma</strong>
                                        </span>
                                        <span className="vitals-action-card__arrow"><ChevronRight size={20} /></span>
                                    </button>
                                </section>
                            </div>
                        )}

                        {/* PESTAÑA 2: ODONTOGRAMA */}
                        {activeTab === 'odontograma' && (
                            <div>
                                <section className="nurse-card patient-selector-card" style={{ marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div className="nurse-card__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><User size={20} /></div>
                                            <div>
                                                <h3>Paciente para Odontograma</h3>
                                                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                                                    {selectedPatient ? (
                                                        <strong>{selectedPatient.nombre_completo} (Cédula: {selectedPatient.cedula || selectedPatient.numero_cedula})</strong>
                                                    ) : (
                                                        "Ninguno - Debe buscar un paciente para registrar su odontograma."
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button className="action-button action-button--primary" onClick={() => { setModalSearchCedula(''); setModalSearchResults([]); setIsPatientSearchOpen(true); }}>
                                                <Search size={14} /> Buscar Paciente
                                            </button>
                                            <button className="action-button action-button--accent" onClick={() => { setNewPatientForm({ nombre_completo: '', tipo_documento: 'cedula', cedula: '', pais_origen: '', id_tipo_usuario: 2, correo: '' }); setRegisterError(''); setIsPatientRegisterOpen(true); }}>
                                                <UserPlus size={14} /> Registrar Paciente
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                {!selectedPatient ? (
                                    <div className="patient-empty-state show">
                                        <User size={40} />
                                        <strong>No hay paciente seleccionado</strong>
                                        <p>Busca e introduce un paciente para registrar o editar su odontograma.</p>
                                    </div>
                                ) : odontogramaLoading ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}><span className="spinner"></span></div>
                                ) : (
                                    <div className="odontograma-container">
                                        <h3 style={{ color: 'var(--primary)', fontWeight: '750', fontSize: '16px', marginBottom: '8px', textAlign: 'center' }}>
                                            ODONTOGRAMA DENTAL (ADULTO)
                                        </h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', marginBottom: '24px' }}>
                                            Selecciona un estado en la barra de herramientas y haz clic en la cara del diente para aplicarlo.
                                        </p>

                                        <div className="dentist-toolbar">
                                            {/* Botón Sano siempre al inicio */}
                                            <button
                                                className={`state-selector-btn ${selectedStateTool === 'sano' ? 'active' : ''}`}
                                                style={selectedStateTool === 'sano' ? { backgroundColor: '#64748b', color: '#ffffff' } : {}}
                                                onClick={() => setSelectedStateTool('sano')}
                                            >
                                                <span className="state-color-dot" style={{ backgroundColor: '#ffffff', borderColor: '#64748b' }}></span>
                                                <span>Sano</span>
                                            </button>

                                            {/* Estados dinámicos de la base de datos */}
                                            {odontogramaEstados.map(state => {
                                                const isActive = String(selectedStateTool) === String(state.id);
                                                const isAusente = state.nombre.toLowerCase() === 'ausente';
                                                const btnStyle = isActive ? { backgroundColor: state.color, color: '#ffffff', borderColor: 'transparent' } : {};
                                                return (
                                                    <button
                                                        key={state.id}
                                                        className={`state-selector-btn ${isActive ? 'active' : ''}`}
                                                        style={btnStyle}
                                                        onClick={() => setSelectedStateTool(state.id)}
                                                    >
                                                        {isAusente ? (
                                                            <span className="state-color-dot" style={{ borderRadius: '0', clipPath: 'polygon(20% 0%, 0% 20%, 30% 50%, 0% 80%, 20% 100%, 50% 70%, 80% 100%, 100% 80%, 70% 50%, 100% 20%, 80% 0%, 50% 30%)', backgroundColor: state.color }}></span>
                                                        ) : (
                                                            <span className="state-color-dot" style={{ backgroundColor: state.color }}></span>
                                                        )}
                                                        <span>{state.nombre}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="odontograma-section">
                                            <h4>Arcada Superior</h4>
                                            <div className="odontograma-row">
                                                {upperRightTeeth.map(num => (
                                                    <ToothSvg key={num} toothNum={num} />
                                                ))}
                                                <div style={{ width: '2px', background: 'var(--border)', margin: '0 10px' }} />
                                                {upperLeftTeeth.map(num => (
                                                    <ToothSvg key={num} toothNum={num} />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="odontograma-section">
                                            <h4>Arcada Inferior</h4>
                                            <div className="odontograma-row">
                                                {lowerRightTeeth.map(num => (
                                                    <ToothSvg key={num} toothNum={num} />
                                                ))}
                                                <div style={{ width: '2px', background: 'var(--border)', margin: '0 10px' }} />
                                                {lowerLeftTeeth.map(num => (
                                                    <ToothSvg key={num} toothNum={num} />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="odontograma-legend">
                                            <div className="legend-item">
                                                <span className="state-color-dot" style={{ backgroundColor: '#ffffff', borderColor: '#64748b' }}></span>
                                                <span>Sano</span>
                                            </div>
                                            {odontogramaEstados.map(state => (
                                                <div key={state.id} className="legend-item">
                                                    <span className="state-color-dot" style={{ backgroundColor: state.color }}></span>
                                                    <span>{state.nombre} {state.descripcion ? `(${state.descripcion})` : ''}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                                            <button className="action-button action-button--primary" style={{ minWidth: '150px' }} disabled={odontogramaSaving} onClick={handleSaveOdontograma}>
                                                <Save size={14} />
                                                <span>{odontogramaSaving ? 'Guardando...' : 'Guardar Odontograma'}</span>
                                            </button>
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
                                        <span className="page-hero__label"><ClipboardList size={14} style={{ marginRight: '6px', display: 'inline' }} /> Consulta de jornada</span>
                                        <h2>Parte diario de Odontología</h2>
                                        <p>Consulta las atenciones registradas desde Ficha y Anamnesis en la fecha indicada.</p>
                                    </div>
                                    <div className="page-hero__icon"><CalendarCheck size={34} /></div>
                                </section>

                                <section className="module-grid" style={{ marginTop: '20px' }}>
                                    <article className="nurse-card span-12 daily-header-card">
                                        <div className="daily-date-control" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <div>
                                                <span className="eyebrow">PARTE DE LA JORNADA</span>
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
                                                        <span>Certificado Dental</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: '#e9f8f2', color: 'var(--success)' }}>
                                                            <CheckCircle size={12} />
                                                        </span>
                                                        <span>Validación</span>
                                                    </div>
                                                </div>

                                                {parteDiarioList.map((item, idx) => {
                                                    const patientIdent = item.paciente?.datos_identificacion || item.paciente?.datosIdentificacion;
                                                    const patientName = patientIdent
                                                        ? `${patientIdent.primer_nombre} ${patientIdent.apellido_paterno}`
                                                        : item.paciente?.name || item.paciente?.email || 'Usuario registrado';

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
                                                                <strong>{patientName}</strong>
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

                        {/* PESTAÑA 4: EVOLUCION */}
                        {activeTab === 'evolucion' && (
                            <div>
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
                                        <p>Busca e introduce un paciente para consultar su historial de tratamientos dentales.</p>
                                    </div>
                                ) : (
                                    <div style={{ padding: '10px 0' }}>
                                        <div style={{ marginBottom: '24px' }}>
                                            <h3 style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '18px', margin: 0 }}>Historial Clínico de Odontología</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '4px 0 0' }}>Consulte el seguimiento de tratamientos y consultas dentales del paciente.</p>
                                        </div>

                                        {/* Table and Detail Grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: activeBookRecord ? '1fr 1fr' : '1fr', gap: '20px', alignItems: 'start' }}>
                                            {/* Table Column */}
                                            <div className="evolution-table-container">
                                                {areaHistoriesLoading ? (
                                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Cargando registros...</div>
                                                ) : !areaHistories.odontologia || areaHistories.odontologia.length === 0 ? (
                                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                        No se registran antecedentes en odontología.
                                                    </div>
                                                ) : (
                                                    <table className="evolution-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Fecha</th>
                                                                <th>Especialidad</th>
                                                                <th>Detalle / Diagnóstico</th>
                                                                <th>Acción</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {areaHistories.odontologia.map((record, index) => (
                                                                <tr
                                                                    key={record.id || index}
                                                                    className={activeBookRecord?.id === record.id ? 'active' : ''}
                                                                    onClick={() => setActiveBookRecord(record)}
                                                                >
                                                                    <td>{(record.fecha || record.created_at || '').slice(0, 10)}</td>
                                                                    <td>
                                                                        <span className="evolution-badge evolution-badge--odontologia">
                                                                            {record.recordTitle || record.type}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                        {record.detalle_evolucion || record.detalle_diagnostico || record.detalle_motivo || 'Ver detalles'}
                                                                    </td>
                                                                    <td>
                                                                        <button
                                                                            className="action-button action-button--primary"
                                                                            style={{ fontSize: '11px', minHeight: '30px', padding: '0 12px', borderRadius: '8px' }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setActiveBookRecord(record);
                                                                            }}
                                                                        >
                                                                            Ver Detalle
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>

                                            {/* Detail Column */}
                                            {activeBookRecord && (
                                                <div className="premium-field-card" style={{ padding: '24px', position: 'sticky', top: '20px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 32, 64, 0.05)', paddingBottom: '12px', marginBottom: '16px' }}>
                                                        <div>
                                                            <span className="eyebrow" style={{ textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700 }}>Detalle Clínico</span>
                                                            <h4 style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--primary)', fontWeight: 800 }}>
                                                                {activeBookRecord.recordTitle || 'Atención Odontológica'}
                                                            </h4>
                                                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                                                                Fecha: {(activeBookRecord.fecha || activeBookRecord.created_at || '').slice(0, 10)}
                                                            </p>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button
                                                                className="action-button action-button--accent"
                                                                style={{ fontSize: '11px', minHeight: '32px', padding: '0 12px', borderRadius: '8px' }}
                                                                onClick={() => handleDownloadHistoriaClinicaPdf(selectedPatient.id_usuario || selectedPatient.id, activeBookRecord?.id)}
                                                                title="Descargar Historia Clínica PDF"
                                                            >
                                                                <FileText size={14} /> PDF
                                                            </button>
                                                            <button
                                                                className="action-button action-button--light"
                                                                style={{ minHeight: '32px', width: '32px', padding: 0, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                onClick={() => setActiveBookRecord(null)}
                                                            >
                                                                <X size={15} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }} className="clinical-modal__body">
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

                        {/* PESTAÑA DE INSUMOS MÉDICOS */}
                        {activeTab === 'insumos' && (
                            <div>
                                <section className="page-hero">
                                    <div>
                                        <span className="page-hero__label">
                                            <Package size={14} style={{ marginRight: '6px', display: 'inline' }} /> Inventario y suministros
                                        </span>
                                        <h2>Insumos Médicos Odontológicos</h2>
                                        <p>Control de existencias, administración del catálogo de materiales y seguimiento de consumos por paciente.</p>
                                    </div>
                                    <div className="page-hero__icon">
                                        <Package size={34} />
                                    </div>
                                </section>

                                {/* FILA DE KPIS Y MÉTRICAS */}
                                <section className="psycho-kpis" style={{ marginTop: '20px' }}>
                                    <div className="psycho-kpi-card">
                                        <div className="psycho-kpi-card__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                                            <Package size={20} />
                                        </div>
                                        <div className="psycho-kpi-card__info">
                                            <span>Total Insumos</span>
                                            <strong>{insumosCatalogo.length}</strong>
                                        </div>
                                    </div>

                                    <div className="psycho-kpi-card">
                                        <div className="psycho-kpi-card__icon" style={{ background: insumosCatalogo.filter(i => i.stock !== undefined && i.stock <= 5).length > 0 ? '#fee2e2' : '#fef3c7', color: insumosCatalogo.filter(i => i.stock !== undefined && i.stock <= 5).length > 0 ? '#dc2626' : '#d97706' }}>
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div className="psycho-kpi-card__info">
                                            <span>Stock Crítico / Bajo</span>
                                            <strong style={{ color: insumosCatalogo.filter(i => i.stock !== undefined && i.stock <= 5).length > 0 ? '#dc2626' : 'inherit' }}>
                                                {insumosCatalogo.filter(i => i.stock !== undefined && i.stock <= 5).length}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="psycho-kpi-card">
                                        <div className="psycho-kpi-card__icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                            <ClipboardList size={20} />
                                        </div>
                                        <div className="psycho-kpi-card__info">
                                            <span>Consumos Registrados</span>
                                            <strong>{insumosPacienteList.length}</strong>
                                        </div>
                                    </div>
                                </section>

                                {insumosLoading ? (
                                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                        <div className="loading-spinner" style={{ margin: '0 auto 16px', width: '36px', height: '36px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                        <p style={{ fontSize: '14px' }}>Cargando inventario de insumos...</p>
                                    </div>
                                ) : (
                                    <section className="module-grid" style={{ marginTop: '20px' }}>
                                        {/* SECCIÓN 1: CATÁLOGO DE INSUMOS */}
                                        <article className="nurse-card span-12">
                                            <div className="nurse-card__header" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)', textAlign: 'left', alignItems: 'stretch' }}>
                                                {/* TÍTULO Y CABECERA ALINEADOS A LA IZQUIERDA */}
                                                <div style={{ textAlign: 'left', width: '100%' }}>
                                                    <span className="eyebrow" style={{ display: 'block', textAlign: 'left' }}>CATÁLOGO GENERAL</span>
                                                    <h3 style={{ textAlign: 'left', margin: '4px 0 0 0' }}>Inventario de Materiales Odontológicos</h3>
                                                    <p style={{ textAlign: 'left', margin: '4px 0 0 0' }}>Supervisa las existencias actuales de cada insumo en clínica.</p>
                                                </div>

                                                {/* FILA 1: BUSCADOR EN SU PROPIA FILA DE ANCHO COMPLETO */}
                                                <div style={{ width: '100%', textAlign: 'left' }}>
                                                    <div className="patient-search-input" style={{ width: '100%', maxWidth: '100%' }}>
                                                        <Search size={16} />
                                                        <input
                                                            type="text"
                                                            placeholder="Buscar insumo dental por código, nombre o descripción..."
                                                            value={insumoSearchQuery}
                                                            onChange={(e) => setInsumoSearchQuery(e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                {/* FILA 2: BOTONES DE ACCIÓN ALINEADOS A LA IZQUIERDA Y FILTROS A LA DERECHA */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-start' }}>
                                                        <button
                                                            type="button"
                                                            className="action-button action-button--accent"
                                                            onClick={() => handleOpenAddInsumo()}
                                                        >
                                                            <Package size={14} />
                                                            <span>Añadir Insumo</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="action-button action-button--primary"
                                                            onClick={() => handleOpenAssignInsumo()}
                                                        >
                                                            <PlusCircle size={14} />
                                                            <span>Registrar Consumo</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="action-button action-button--outline"
                                                            onClick={() => handleOpenReport()}
                                                            title="Ver Reporte de Consumo"
                                                        >
                                                            <FileText size={14} />
                                                            <span>Ver Reporte</span>
                                                        </button>
                                                    </div>

                                                    {/* BOTÓN Y MENÚ FLOTANTE DE FILTROS ALINEADO A LA DERECHA */}
                                                    <div style={{ position: 'relative', marginLeft: 'auto' }}>
                                                        <button
                                                            type="button"
                                                            className={`action-button ${showInsumoFilters ? 'action-button--primary' : 'action-button--outline'}`}
                                                            onClick={() => setShowInsumoFilters(!showInsumoFilters)}
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
                                                            {onlyLowStockInsumos && (
                                                                <span style={{
                                                                    background: showInsumoFilters ? '#ffffff' : 'var(--primary)',
                                                                    color: showInsumoFilters ? 'var(--primary)' : '#ffffff',
                                                                    borderRadius: '50%',
                                                                    width: '18px',
                                                                    height: '18px',
                                                                    display: 'grid',
                                                                    placeItems: 'center',
                                                                    fontSize: '10.5px',
                                                                    fontWeight: 'bold',
                                                                    marginLeft: '2px'
                                                                }}>
                                                                    1
                                                                </span>
                                                            )}
                                                            <ChevronDown size={14} style={{ transform: showInsumoFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', marginLeft: '2px' }} />
                                                        </button>

                                                        {/* DROPDOWN FLOTANTE SUPERPUESTO */}
                                                        {showInsumoFilters && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: 'calc(100% + 8px)',
                                                                right: 0,
                                                                zIndex: 100,
                                                                width: '300px',
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
                                                                    {onlyLowStockInsumos && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setOnlyLowStockInsumos(false)}
                                                                            style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                        >
                                                                            <X size={13} /> Limpiar
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setOnlyLowStockInsumos(!onlyLowStockInsumos)}
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
                                                                            border: onlyLowStockInsumos ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                                                                            background: onlyLowStockInsumos ? '#fee2e2' : '#f8fafc',
                                                                            color: onlyLowStockInsumos ? '#991b1b' : '#334155'
                                                                        }}
                                                                    >
                                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <AlertTriangle size={14} style={{ color: onlyLowStockInsumos ? '#dc2626' : '#94a3b8' }} />
                                                                            Solo Stock Bajo / Crítico (≤ 5)
                                                                        </span>
                                                                        {onlyLowStockInsumos && <span style={{ fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {insumosCatalogo.length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                                    <Package size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
                                                    <p>No hay insumos registrados en el catálogo.</p>
                                                    <button className="action-button action-button--primary" style={{ marginTop: '10px', fontSize: '13px' }} onClick={() => handleOpenAddInsumo()}>
                                                        <PlusCircle size={13} style={{ marginRight: '5px' }} /> Añadir primer insumo
                                                    </button>
                                                </div>
                                            ) : (() => {
                                                const filtered = insumosCatalogo.filter(item => {
                                                    const matchesQuery = item.nombre.toLowerCase().includes(insumoSearchQuery.toLowerCase());
                                                    const matchesLowStock = onlyLowStockInsumos ? (item.stock !== undefined && item.stock <= 5) : true;
                                                    return matchesQuery && matchesLowStock;
                                                });
                                                const itemsPerPage = 10;
                                                const totalPages = Math.ceil(filtered.length / itemsPerPage);
                                                const currentPageSafe = Math.min(catalogCurrentPage, totalPages || 1);
                                                const paginatedItems = filtered.slice((currentPageSafe - 1) * itemsPerPage, currentPageSafe * itemsPerPage);

                                                return (
                                                    <>
                                                        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
                                                            <table className="daily-table" style={{ width: '100%' }}>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Código / ID</th>
                                                                        <th>Nombre del Insumo Odontológico</th>
                                                                        <th>Estado de Inventario</th>
                                                                        <th style={{ textAlign: 'center' }}>Existencias (Stock)</th>
                                                                        <th style={{ textAlign: 'center' }}>Acciones</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {paginatedItems.map(insumo => {
                                                                        const stockLow = insumo.stock !== undefined && insumo.stock <= 5 && insumo.stock > 0;
                                                                        const stockOut = insumo.stock !== undefined && insumo.stock === 0;

                                                                        return (
                                                                            <tr
                                                                                key={insumo.id}
                                                                                style={{
                                                                                    background: stockOut ? '#fff5f5' : stockLow ? '#fffbeb' : 'transparent'
                                                                                }}
                                                                            >
                                                                                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                                                                    #{String(insumo.id).padStart(4, '0')}
                                                                                </td>
                                                                                <td>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                                        <strong style={{ fontSize: '13px', color: '#1e293b' }}>{insumo.nombre}</strong>
                                                                                    </div>
                                                                                </td>
                                                                                <td>
                                                                                    {stockOut ? (
                                                                                        <span style={{ fontSize: '10.5px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                                            ● SIN STOCK (Agotado)
                                                                                        </span>
                                                                                    ) : stockLow ? (
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
                                                                                    <span style={{ fontSize: '14px', fontWeight: '800', color: stockOut ? '#dc2626' : stockLow ? '#d97706' : 'var(--primary)' }}>
                                                                                        {insumo.stock ?? '0'}
                                                                                    </span>
                                                                                    <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: '4px' }}>unidades</small>
                                                                                </td>
                                                                                <td style={{ textAlign: 'center' }}>
                                                                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                                                                                        {/* Editar */}
                                                                                        <button
                                                                                            type="button"
                                                                                            title="Editar Insumo"
                                                                                            onClick={() => handleOpenAddInsumo(insumo)}
                                                                                            style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', width: '28px', height: '28px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                                                                                        >
                                                                                            <Pencil size={14} />
                                                                                        </button>
                                                                                        {/* Eliminar */}
                                                                                        <button
                                                                                            type="button"
                                                                                            title="Eliminar Insumo"
                                                                                            onClick={() => handleDeleteInsumo(insumo.id)}
                                                                                            style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '6px', width: '28px', height: '28px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                                                                                        >
                                                                                            <Trash2 size={14} />
                                                                                        </button>
                                                                                    </div>
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
                                                                    onClick={() => setCatalogCurrentPage(prev => Math.max(prev - 1, 1))}
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
                                                                    onClick={() => setCatalogCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
                                                );
                                            })()}
                                        </article>
                                    </section>
                                )}

                                {isQuickStockModalOpen && quickStockTarget && createPortal(
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(5px)', display: 'grid', placeItems: 'center', padding: '16px' }}>
                                        <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                                            <div style={{ background: quickStockType === 'add' ? '#166534' : '#991b1b', padding: '16px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {quickStockType === 'add' ? <Plus size={18} /> : <Minus size={18} />}
                                                    {quickStockType === 'add' ? 'Ingreso de Stock a Insumo' : 'Egreso / Salida de Stock'}
                                                </h3>
                                                <button onClick={() => setIsQuickStockModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
                                            </div>
                                            <form onSubmit={handleSaveQuickStock} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Insumo seleccionado</span>
                                                    <h4 style={{ margin: '2px 0 0', fontSize: '14px', color: '#1e293b', fontWeight: '700' }}>{quickStockTarget.nombre}</h4>
                                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569' }}>
                                                        Stock actual: <strong>{quickStockTarget.stock ?? 0} unidades</strong>
                                                    </p>
                                                </div>

                                                <div>
                                                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                                                        {quickStockType === 'add' ? 'Cantidad a ingresar (unidades) *' : 'Cantidad a descontar (unidades) *'}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        required
                                                        value={quickStockAmount}
                                                        onChange={(e) => setQuickStockAmount(e.target.value)}
                                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600' }}
                                                    />
                                                </div>

                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsQuickStockModalOpen(false)}
                                                        className="action-button action-button--light"
                                                        style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px' }}
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={quickStockLoading}
                                                        className={`action-button ${quickStockType === 'add' ? 'action-button--accent' : 'action-button--outline'}`}
                                                        style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '12.5px', background: quickStockType === 'add' ? '#166534' : '#dc2626', color: '#fff', border: 'none' }}
                                                    >
                                                        {quickStockLoading ? 'Guardando...' : quickStockType === 'add' ? 'Confirmar Ingreso' : 'Confirmar Egreso'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {isAddInsumoModalOpen && createPortal(
                                    <div className="clinical-modal show">
                                        <div className="clinical-modal__backdrop" onClick={() => setIsAddInsumoModalOpen(false)}></div>
                                        <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '460px' }}>
                                            <header className="clinical-modal__header">
                                                <div className="clinical-modal__patient">
                                                    <div className="clinical-modal__avatar" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}><Package size={18} /></div>
                                                    <div>
                                                        <span>Inventario clínico</span>
                                                        <h2>{insumoForm.id ? 'Editar Insumo Odontológico' : 'Añadir Insumo Odontológico'}</h2>
                                                    </div>
                                                </div>
                                                <button className="clinical-modal__close" onClick={() => setIsAddInsumoModalOpen(false)}><X size={16} /></button>
                                            </header>

                                            <div className="clinical-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                <div className="premium-field-card">
                                                    <div className="field-header">
                                                        <div className="field-header__left">
                                                            <span className="field-header__icon"><Package size={15} /></span>
                                                            <h4 className="field-header__title">Nombre del Insumo Odontológico</h4>
                                                        </div>
                                                        <span className="field-badge-req">Requerido</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej: Guantes de nitrilo, Hilo dental, Amalgama..."
                                                        value={insumoForm.nombre}
                                                        onChange={e => setInsumoForm(f => ({ ...f, nombre: e.target.value }))}
                                                        required
                                                    />
                                                </div>

                                                {insumoForm.id ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        {/* Resumen del Stock Actual */}
                                                        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Stock Actual en Clínica:</span>
                                                            <strong style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '800' }}>{insumoForm.stock_base ?? insumoForm.stock ?? 0} unidades</strong>
                                                        </div>

                                                        {/* Opción 1: Añadir Incremento al Stock (+) */}
                                                        <div className="premium-field-card" style={{ border: '1.5px solid var(--primary-soft)' }}>
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><PlusCircle size={15} /></span>
                                                                    <h4 className="field-header__title">Añadir Incremento al Stock (+)</h4>
                                                                </div>
                                                                <span className="field-badge-opt" style={{ background: '#dcfce7', color: '#166534' }}>Recomendado</span>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                placeholder="Ej: 10 (se sumará al stock actual)"
                                                                value={insumoForm.incremento || ''}
                                                                onChange={e => {
                                                                    const inc = e.target.value;
                                                                    const base = Number(insumoForm.stock_base ?? insumoForm.stock ?? 0);
                                                                    const newStock = inc !== '' ? base + Number(inc) : base;
                                                                    setInsumoForm(f => ({ ...f, incremento: inc, stock: newStock }));
                                                                }}
                                                            />
                                                            {insumoForm.incremento !== '' && Number(insumoForm.incremento) > 0 && (
                                                                <div style={{ marginTop: '6px', fontSize: '11px', color: '#166534', background: '#dcfce7', padding: '4px 10px', borderRadius: '8px', fontWeight: '700' }}>
                                                                    ✓ Se sumarán +{insumoForm.incremento} unidades. Nuevo Stock Total: {Number(insumoForm.stock_base ?? 0) + Number(insumoForm.incremento)} unidades.
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Opción 2: Establecer Stock Total Directo */}
                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><Hash size={15} /></span>
                                                                    <h4 className="field-header__title">O Establecer Cantidad Total Directa</h4>
                                                                </div>
                                                                <span className="field-badge-req">Total Directo</span>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                placeholder="Ej: 50"
                                                                value={insumoForm.stock}
                                                                onChange={e => {
                                                                    const val = e.target.value;
                                                                    setInsumoForm(f => ({ ...f, stock: val, incremento: '' }));
                                                                }}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="premium-field-card">
                                                        <div className="field-header">
                                                            <div className="field-header__left">
                                                                <span className="field-header__icon"><Hash size={15} /></span>
                                                                <h4 className="field-header__title">Stock Inicial (Unidades)</h4>
                                                            </div>
                                                            <span className="field-badge-req">Requerido</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder="Ej: 50"
                                                            value={insumoForm.stock}
                                                            onChange={e => setInsumoForm(f => ({ ...f, stock: e.target.value }))}
                                                            required
                                                        />
                                                    </div>
                                                )}

                                                <footer className="clinical-modal__actions" style={{ marginTop: '12px' }}>
                                                    <button className="action-button action-button--light" onClick={() => setIsAddInsumoModalOpen(false)}>Cancelar</button>
                                                    <button className="action-button action-button--primary" onClick={handleSaveInsumo} disabled={insumoFormLoading}>
                                                        {insumoFormLoading ? 'Guardando...' : (insumoForm.id ? 'Actualizar Insumo' : 'Guardar Insumo')}
                                                    </button>
                                                </footer>
                                            </div>
                                        </div>
                                    </div>,
                                    document.body
                                )}

                                {/* MODAL: REGISTRAR CONSUMO DE PACIENTE */}
                                {isAssignInsumoModalOpen && createPortal(
                                    <div className="clinical-modal show">
                                        <div className="clinical-modal__backdrop" onClick={() => setIsAssignInsumoModalOpen(false)}></div>
                                        <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '500px' }}>
                                            <header className="clinical-modal__header">
                                                <div className="clinical-modal__patient">
                                                    <div className="clinical-modal__avatar" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}><ClipboardList size={18} /></div>
                                                    <div>
                                                        <span>Uso de materiales</span>
                                                        <h2>Registrar Consumo de Insumo</h2>
                                                    </div>
                                                </div>
                                                <button className="clinical-modal__close" onClick={() => setIsAssignInsumoModalOpen(false)}><X size={16} /></button>
                                            </header>

                                            <div className="clinical-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                {/* Buscar Paciente */}
                                                <div className="premium-field-card">
                                                    <div className="field-header">
                                                        <div className="field-header__left">
                                                            <span className="field-header__icon"><User size={15} /></span>
                                                            <h4 className="field-header__title">Paciente Atendido</h4>
                                                        </div>
                                                        <span className="field-badge-req">Requerido</span>
                                                    </div>
                                                    {insumoSelectedPatient ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--primary-soft)', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid var(--primary)' }}>
                                                            <div>
                                                                <div style={{ fontWeight: 650, fontSize: '12.5px', color: 'var(--primary)' }}>{insumoSelectedPatient.nombre_completo || insumoSelectedPatient.name}</div>
                                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>C.I.: {insumoSelectedPatient.cedula || insumoSelectedPatient.numero_cedula || '—'}</div>
                                                            </div>
                                                            <button
                                                                onClick={() => { setInsumoSelectedPatient(null); setConsumoForm(f => ({ ...f, id_usuario_paciente: '' })); }}
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '20px', fontWeight: 'bold' }}
                                                            >×</button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                            <div className="patient-search-input" style={{ flex: 1, minHeight: '44px', margin: 0 }}>
                                                                <Search size={16} />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Buscar por cédula o nombre..."
                                                                    value={insumoPatientSearch}
                                                                    onChange={e => handleInsumoPatientSearch(e.target.value)}
                                                                    onKeyDown={e => e.key === 'Enter' && handleInsumoPatientSearch()}
                                                                    style={{ border: 'none', background: 'transparent', padding: 0, minHeight: 'auto', boxShadow: 'none' }}
                                                                />
                                                            </div>
                                                            <button className="action-button action-button--primary" onClick={handleInsumoPatientSearch} disabled={insumoPatientSearchLoading} style={{ minHeight: '44px', borderRadius: '12px' }}>
                                                                {insumoPatientSearchLoading ? '...' : 'Buscar'}
                                                            </button>
                                                        </div>
                                                    )}
                                                    {insumoPatientResults.length > 0 && !insumoSelectedPatient && (
                                                        <div style={{ marginTop: '6px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: '12px', maxHeight: '160px', overflowY: 'auto', boxShadow: 'var(--shadow-sm)' }}>
                                                            {insumoPatientResults.map(p => (
                                                                <div
                                                                    key={p.id || p.id_usuario}
                                                                    onClick={() => {
                                                                        setInsumoSelectedPatient(p);
                                                                        setConsumoForm(f => ({ ...f, id_usuario_paciente: p.id_usuario || p.id }));
                                                                        setInsumoPatientResults([]);
                                                                    }}
                                                                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '12px', transition: 'background 0.15s' }}
                                                                    className="patient-item-option"
                                                                >
                                                                    <div style={{ fontWeight: 650, color: 'var(--text-primary)' }}>{p.nombre_completo || p.name}</div>
                                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>C.I.: {p.cedula || p.numero_cedula}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Seleccionar Insumo */}
                                                <div className="premium-field-card">
                                                    <div className="field-header">
                                                        <div className="field-header__left">
                                                            <span className="field-header__icon"><Package size={15} /></span>
                                                            <h4 className="field-header__title">Insumo Utilizado</h4>
                                                        </div>
                                                        <span className="field-badge-req">Requerido</span>
                                                    </div>
                                                    <select
                                                        value={consumoForm.id_insumo}
                                                        onChange={e => setConsumoForm(f => ({ ...f, id_insumo: e.target.value }))}
                                                        required
                                                    >
                                                        <option value="">Selecciona un insumo...</option>
                                                        {insumosCatalogo.map(c => (
                                                            <option key={c.id} value={c.id}>{c.nombre} (Stock actual: {c.stock ?? '—'})</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Cantidad */}
                                                <div className="premium-field-card">
                                                    <div className="field-header">
                                                        <div className="field-header__left">
                                                            <span className="field-header__icon"><Hash size={15} /></span>
                                                            <h4 className="field-header__title">Cantidad Gastada</h4>
                                                        </div>
                                                        <span className="field-badge-req">Requerido</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej: 1, 2, 1/2x, 1 unidad..."
                                                        value={consumoForm.cantidad_gastada}
                                                        onChange={e => setConsumoForm(f => ({ ...f, cantidad_gastada: e.target.value }))}
                                                        required
                                                    />
                                                    <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.4 }}>
                                                        El inventario se reducirá automáticamente según la cifra indicada (ej: "2" descontará 2 del stock).
                                                    </p>
                                                </div>

                                                <footer className="clinical-modal__actions" style={{ marginTop: '12px' }}>
                                                    <button className="action-button action-button--light" onClick={() => setIsAssignInsumoModalOpen(false)}>Cancelar</button>
                                                    <button className="action-button action-button--primary" onClick={handleSaveConsumo} disabled={consumoFormLoading}>
                                                        {consumoFormLoading ? 'Registrando...' : 'Registrar Consumo'}
                                                    </button>
                                                </footer>
                                            </div>
                                        </div>
                                    </div>,
                                    document.body
                                )}

                                {/* MODAL: REPORTE MENSUAL DE CONSUMOS (A4 LANDSCAPE) */}
                                {isReportModalOpen && (
                                    <div className="clinical-modal show no-print-backdrop" style={{ zIndex: 3000 }}>
                                        <div className="clinical-modal__backdrop no-print" onClick={() => setIsReportModalOpen(false)}></div>
                                        <div className="clinical-modal__dialog" style={{ width: '95vw', maxWidth: '1200px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

                                            <style dangerouslySetInnerHTML={{
                                                __html: `
                                                @media print {
                                                    body * {
                                                        visibility: hidden !important;
                                                    }
                                                    .a4-landscape-page, .a4-landscape-page * {
                                                        visibility: visible !important;
                                                    }
                                                    .a4-landscape-page {
                                                        position: absolute;
                                                        left: 0;
                                                        top: 0;
                                                        width: 100% !important;
                                                        margin: 0 !important;
                                                        padding: 0 !important;
                                                        box-shadow: none !important;
                                                        background: #fff !important;
                                                        color: #000 !important;
                                                    }
                                                    .no-print, .no-print-backdrop {
                                                        display: none !important;
                                                        visibility: hidden !important;
                                                    }
                                                    @page {
                                                        size: A4 landscape;
                                                        margin: 8mm;
                                                    }
                                                }
                                            `}} />

                                            <header className="clinical-modal__header no-print">
                                                <div className="clinical-modal__patient">
                                                    <div className="clinical-modal__avatar" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}><FileText size={18} /></div>
                                                    <div>
                                                        <span>Generar documento mensual</span>
                                                        <h2>Consumo de Materiales e Insumos</h2>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    {/* Filtro de Mes */}
                                                    <select
                                                        value={reportMonth}
                                                        onChange={e => setReportMonth(parseInt(e.target.value))}
                                                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}
                                                    >
                                                        <option value="1" style={{ color: '#000' }}>Enero</option>
                                                        <option value="2" style={{ color: '#000' }}>Febrero</option>
                                                        <option value="3" style={{ color: '#000' }}>Marzo</option>
                                                        <option value="4" style={{ color: '#000' }}>Abril</option>
                                                        <option value="5" style={{ color: '#000' }}>Mayo</option>
                                                        <option value="6" style={{ color: '#000' }}>Junio</option>
                                                        <option value="7" style={{ color: '#000' }}>Julio</option>
                                                        <option value="8" style={{ color: '#000' }}>Agosto</option>
                                                        <option value="9" style={{ color: '#000' }}>Septiembre</option>
                                                        <option value="10" style={{ color: '#000' }}>Octubre</option>
                                                        <option value="11" style={{ color: '#000' }}>Noviembre</option>
                                                        <option value="12" style={{ color: '#000' }}>Diciembre</option>
                                                    </select>
                                                    {/* Filtro de Año */}
                                                    <select
                                                        value={reportYear}
                                                        onChange={e => setReportYear(parseInt(e.target.value))}
                                                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}
                                                    >
                                                        {[2025, 2026, 2027, 2028, 2029].map(y => (
                                                            <option key={y} value={y} style={{ color: '#000' }}>{y}</option>
                                                        ))}
                                                    </select>
                                                    <button className="action-button action-button--primary" onClick={handlePrintInsumosReport} style={{ minHeight: '34px', fontSize: '12px' }}>
                                                        Imprimir
                                                    </button>
                                                    <button className="clinical-modal__close" onClick={() => setIsReportModalOpen(false)} style={{ color: '#fff' }}><X size={16} /></button>
                                                </div>
                                            </header>

                                            <div className="clinical-modal__body printable-report-body" style={{ flex: 1, overflowY: 'auto', padding: '30px', background: '#fff' }}>
                                                {reportLoading ? (
                                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                                        <div className="loading-spinner" style={{ margin: '0 auto 16px', width: '36px', height: '36px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                                        <p>Cargando datos clínicos...</p>
                                                    </div>
                                                ) : (
                                                    <div className="a4-landscape-page" style={{ fontFamily: 'Arial, sans-serif', color: '#000', margin: '0 auto', padding: '10px' }}>

                                                        {/* CABECERA INSTITUCIONAL */}
                                                        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                                                            <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Universidad Estatal de Bolívar</h2>
                                                            <h3 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: '#475569' }}>Bienestar Universitario</h3>
                                                            <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Consumo Diario de Materiales Odontológicos Unidad Operativa</h3>
                                                            <h4 style={{ margin: '0', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#1e293b' }}>Consumo Diario de Materiales e Insumos Odontológicos</h4>
                                                        </div>

                                                        {/* METADATOS DEL REPORTE */}
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '11px', marginBottom: '15px' }}>
                                                            <div>
                                                                <div style={{ marginBottom: '4px' }}><strong>UNIDAD:</strong> BIENESTAR UNIVERSITARIO</div>
                                                                <div><strong>ODONTÓLOGO UNIDAD OPERATIVA:</strong> {user?.name ? user.name.toUpperCase() : 'PROFESIONAL RESPONSABLE'}</div>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <div><strong>MES/AÑO:</strong> {reportMonth.toString().padStart(2, '0')}/{reportYear}</div>
                                                            </div>
                                                        </div>

                                                        {/* TABLA PRINCIPAL DE CONSUMOS */}
                                                        <div style={{ overflowX: 'auto', width: '100%' }}>
                                                            <table className="report-print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1.5px solid #000' }}>
                                                                <thead>
                                                                    <tr>
                                                                        <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', width: '40px', fontWeight: 'bold' }}>N. Pacientes</th>
                                                                        <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', minWidth: '150px', fontWeight: 'bold' }}>Nombre de Usuario</th>

                                                                        {/* Encabezados verticales dinámicos para cada insumo */}
                                                                        {insumosCatalogo.map(insumo => (
                                                                            <th key={insumo.id} className="supply-header-cell" style={{ border: '1px solid #000', padding: '8px 2px', width: '35px', position: 'relative', height: '140px', verticalAlign: 'bottom', textAlign: 'center' }}>
                                                                                <div className="vertical-text" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontSize: '9px', fontWeight: 'bold', display: 'inline-block', width: '100%', textAlign: 'left', boxSizing: 'border-box' }}>
                                                                                    {insumo.nombre.toUpperCase()}
                                                                                </div>
                                                                            </th>
                                                                        ))}

                                                                        <th style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', minWidth: '180px', fontWeight: 'bold' }}>Diagnóstico del Paciente</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(() => {
                                                                        // Filtramos consumos para el mes/año seleccionado de forma segura mediante slice
                                                                        const filteredConsumos = insumosPacienteList.filter(item => {
                                                                            const rawDate = item.fecha || item.created_at || '';
                                                                            if (!rawDate) return false;
                                                                            const dateStr = String(rawDate).slice(0, 7); // "YYYY-MM"
                                                                            const targetMonthStr = `${reportYear}-${String(reportMonth).padStart(2, '0')}`;
                                                                            return dateStr === targetMonthStr;
                                                                        });

                                                                        // Agrupamos por paciente
                                                                        const getParsedQty = (qtyStr) => {
                                                                            const match = (qtyStr || '').trim().match(/^\d+(\.\d+)?/);
                                                                            return match ? parseFloat(match[0]) || 1 : 1;
                                                                        };

                                                                        const getPatientDiagnosis = (patientId) => {
                                                                            const patientParts = allParteDiarioForDiagnosis.filter(p => parseInt(p.id_usuario_paciente) === parseInt(patientId));
                                                                            if (patientParts.length > 0) {
                                                                                const sorted = [...patientParts].sort((a, b) => {
                                                                                    const dateA = a.fecha || '';
                                                                                    const dateB = b.fecha || '';
                                                                                    return dateB.localeCompare(dateA);
                                                                                });
                                                                                return sorted[0].detalle_diagnostico || sorted[0].procedimiento || 'Consulta General';
                                                                            }
                                                                            return 'Consulta General';
                                                                        };

                                                                        const groupedData = {};
                                                                        filteredConsumos.forEach(item => {
                                                                            const pid = item.id_usuario_paciente;
                                                                            if (!groupedData[pid]) {
                                                                                groupedData[pid] = {
                                                                                    paciente: item.paciente,
                                                                                    consumos: {},
                                                                                    diagnostico: getPatientDiagnosis(pid)
                                                                                };
                                                                            }
                                                                            const insumoId = item.id_insumo;
                                                                            const qty = getParsedQty(item.cantidad_gastada);
                                                                            groupedData[pid].consumos[insumoId] = (groupedData[pid].consumos[insumoId] || 0) + qty;
                                                                        });

                                                                        const rows = Object.values(groupedData);

                                                                        if (rows.length === 0) {
                                                                            return (
                                                                                <tr>
                                                                                    <td colSpan={insumosCatalogo.length + 3} style={{ border: '1px solid #000', padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                                                                        No se registraron consumos de insumos en el periodo seleccionado.
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        }

                                                                        // Calculamos totales para usar en las filas de abajo
                                                                        const totalPorciones = {};
                                                                        insumosCatalogo.forEach(insumo => {
                                                                            totalPorciones[insumo.id] = rows.reduce((acc, row) => acc + (row.consumos[insumo.id] || 0), 0);
                                                                        });

                                                                        return (
                                                                            <>
                                                                                {rows.map((row, idx) => {
                                                                                    const pIdent = row.paciente?.datos_identificacion || row.paciente?.datosIdentificacion;
                                                                                    const pacienteNombre = pIdent
                                                                                        ? `${pIdent.primer_nombre} ${pIdent.segundo_nombre || ''} ${pIdent.apellido_paterno} ${pIdent.apellido_materno || ''}`.replace(/\s+/g, ' ').trim()
                                                                                        : row.paciente?.name || `Paciente ID: ${row.paciente?.id || '—'}`;

                                                                                    return (
                                                                                        <tr key={row.paciente?.id || idx}>
                                                                                            <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>{idx + 1}</td>
                                                                                            <td style={{ border: '1px solid #000', padding: '6px', fontWeight: '500' }}>{pacienteNombre.toUpperCase()}</td>

                                                                                            {insumosCatalogo.map(insumo => {
                                                                                                const val = row.consumos[insumo.id];
                                                                                                return (
                                                                                                    <td key={insumo.id} style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold', background: val ? '#f8fafc' : 'transparent' }}>
                                                                                                        {val ? val : ''}
                                                                                                    </td>
                                                                                                );
                                                                                            })}

                                                                                            <td style={{ border: '1px solid #000', padding: '6px' }}>{row.diagnostico}</td>
                                                                                        </tr>
                                                                                    );
                                                                                })}

                                                                                {/* FILA: TOTAL PORCIONES UNIDADES */}
                                                                                <tr style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                                                                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}></td>
                                                                                    <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>Total Porciones Unidades</td>
                                                                                    {insumosCatalogo.map(insumo => (
                                                                                        <td key={insumo.id} style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', color: '#1e3a8a' }}>
                                                                                            {totalPorciones[insumo.id] || '0'}
                                                                                        </td>
                                                                                    ))}
                                                                                    <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                                                                                </tr>

                                                                                {/* FILA: TOTAL FRASCOS UTILIZADOS */}
                                                                                <tr style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                                                                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}></td>
                                                                                    <td style={{ border: '1px solid #000', padding: '6px', textTransform: 'uppercase' }}>Total Frascos Utilizados</td>
                                                                                    {insumosCatalogo.map(insumo => (
                                                                                        <td key={insumo.id} style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', color: '#b71a34' }}>
                                                                                            {totalPorciones[insumo.id] > 0 ? 1 : '0'}
                                                                                        </td>
                                                                                    ))}
                                                                                    <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                                                                                </tr>
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        {/* NOTA ACLARATORIA AL PIE */}
                                                        <div style={{ marginTop: '20px', fontSize: '9px', fontStyle: 'italic', borderTop: '1px solid #000', paddingTop: '8px' }}>
                                                            <strong>NOTA:</strong> UTILICE EL NÚMERO 1 PARA UN FRASCO NUEVO Y UTILICE EL NÚMERO DE X PARA INDICAR LAS PORCIONES UTILIZADAS
                                                        </div>

                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PESTAÑA: PROCEDIMIENTOS ODONTOLÓGICOS */}
                        {activeTab === 'procedimientos' && (
                            <div>
                                <section className="page-hero">
                                    <div>
                                        <span className="page-hero__label"><BriefcaseMedical size={14} style={{ marginRight: '6px', display: 'inline' }} /> Catálogo clínico</span>
                                        <h2>Procedimientos Odontológicos</h2>
                                        <p>Administra los procedimientos dentales disponibles para seleccionarlos en las atenciones clínicas y odontogramas.</p>
                                    </div>
                                    <div className="page-hero__icon"><BriefcaseMedical size={34} /></div>
                                </section>

                                <section className="module-grid" style={{ marginTop: '20px' }}>
                                    <article className="nurse-card span-12">
                                        <div className="nurse-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                                            <div>
                                                <h3>Gestión del Catálogo de Procedimientos</h3>
                                                <p>Agrega nuevos procedimientos dentales y administra el catálogo actual del odontólogo.</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                {/* Formulario para agregar */}
                                                <form onSubmit={handleAddProcedure} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <div className="patient-search-input" style={{ minWidth: '260px' }}>
                                                        <BriefcaseMedical size={16} />
                                                        <input
                                                            value={newProcedureName}
                                                            onChange={(e) => setNewProcedureName(e.target.value)}
                                                            placeholder="Nuevo procedimiento (ej. Carillas)..."
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

                                        {procedureLoading ? (
                                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                                <span className="spinner"></span> Cargando catálogo de procedimientos...
                                            </div>
                                        ) : (
                                            <div style={{ overflowX: 'auto', marginTop: '24px' }}>
                                                <table className="daily-table" style={{ width: '100%' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '60px', textAlign: 'center' }}>N°</th>
                                                            <th>Procedimiento Odontológico</th>
                                                            <th>Estado</th>
                                                            <th style={{ width: '120px', textAlign: 'center' }}>Acción</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {proceduresCatalog
                                                            .filter(p => (p.nombre_procedimiento || '').toLowerCase().includes(procedureSearchQuery.toLowerCase()))
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
                                                                            <span style={{ marginRight: '4px', display: 'inline' }} /> Eliminar
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        }
                                                        {proceduresCatalog.filter(p => (p.nombre_procedimiento || '').toLowerCase().includes(procedureSearchQuery.toLowerCase())).length === 0 && (
                                                            <tr>
                                                                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                                                    No se encontraron procedimientos en el catálogo.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </article>
                                </section>
                            </div>
                        )}

                        {/* PESTAÑA 5: CENTRO DE REPORTES DE ODONTOLOGÍA */}
                        {activeTab === 'historial' && (
                            <div>
                                <section className="page-hero" style={{ marginBottom: '20px' }}>
                                    <div>
                                        <span className="page-hero__label"><FileText size={14} style={{ marginRight: '6px', display: 'inline' }} /> Reportes y Gestión</span>
                                        <h2>Centro de Reportes de Odontología</h2>
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
                                        className={`liquid-nav__item ${activeReportSubTab === 'insumos' ? 'active' : ''}`}
                                        onClick={() => setActiveReportSubTab('insumos')}
                                    >
                                        <Package size={16} />
                                        <span>Reporte de Insumos</span>
                                    </button>
                                    <button
                                        className={`liquid-nav__item ${activeReportSubTab === 'citas' ? 'active' : ''}`}
                                        onClick={() => setActiveReportSubTab('citas')}
                                    >
                                        <CalendarCheck size={16} />
                                        <span>Agendamiento de Citas</span>
                                    </button>
                                    <button
                                        className={`liquid-nav__item ${activeReportSubTab === 'mensual' ? 'active' : ''}`}
                                        onClick={() => setActiveReportSubTab('mensual')}
                                    >
                                        <FileText size={16} />
                                        <span>Informe Estadístico Mensual</span>
                                    </button>
                                </div>

                                {/* CONTENEDORES DE CADA SUBTAB */}

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
                                        </article>

                                        <article className="nurse-card span-12" style={{ marginTop: '20px', borderRadius: '14px', padding: '20px' }}>
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
                                                            <span>Certificado Dental</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '6px', background: '#e9f8f2', color: 'var(--success)' }}>
                                                                <CheckCircle size={12} />
                                                            </span>
                                                            <span>Validación</span>
                                                        </div>
                                                    </div>

                                                    {parteDiarioList.map((item, idx) => {
                                                        const patientIdent = item.paciente?.datos_identificacion || item.paciente?.datosIdentificacion;
                                                        const patientName = patientIdent
                                                            ? `${patientIdent.primer_nombre} ${patientIdent.apellido_paterno}`
                                                            : item.paciente?.name || item.paciente?.email || 'Usuario registrado';

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
                                                                    <strong>{patientName}</strong>
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
                                    </div>
                                )}

                                {/* SUBTAB: REPORTE DE INSUMOS */}
                                {activeReportSubTab === 'insumos' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <article className="nurse-card span-12" style={{ borderRadius: '14px', padding: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
                                                <div>
                                                    <span className="eyebrow">CONTROL DE MATERIALES</span>
                                                    <h3>Consumo de Insumos por Fecha</h3>
                                                    <p>Consulte y visualice el reporte oficial de consumos de materiales e insumos odontológicos filtrado por fecha.</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <CalendarDays size={16} color="var(--accent)" />
                                                        <input
                                                            type="date"
                                                            value={reportInsumosFecha}
                                                            onChange={(e) => setReportInsumosFecha(e.target.value)}
                                                            style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', outline: 0 }}
                                                        />
                                                    </label>
                                                    <button className="action-button action-button--accent" onClick={handlePrintInsumosReport} style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '34px' }}>
                                                        <Printer size={14} /> Imprimir Reporte
                                                    </button>
                                                </div>
                                            </div>
                                        </article>

                                        {/* Visor PDF del Reporte de Insumos */}
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
                                                        <span style={{ color: '#fff', fontSize: '12.5px', fontWeight: 600 }}>Reporte_Consumo_Insumos.pdf</span>
                                                        <span style={{ color: '#94a3b8', fontSize: '10px' }}>Vista previa del documento oficial para impresión</span>
                                                    </div>
                                                </div>
                                                <button
                                                    className="action-button action-button--accent"
                                                    onClick={handlePrintInsumosReport}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '32px', fontSize: '11.5px', borderRadius: '8px', padding: '0 14px' }}
                                                >
                                                    <Printer size={14} /> Imprimir / Descargar
                                                </button>
                                            </div>
                                            <div style={{ background: '#334155', padding: '20px', display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
                                                {insumosLoading ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '500px', color: '#fff', gap: '12px' }}>
                                                        <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #fff', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
                                                        <span>Generando vista previa...</span>
                                                    </div>
                                                ) : (
                                                    <iframe
                                                        title="Reporte Insumos"
                                                        srcDoc={compileInsumosReportHtmlString()}
                                                        style={{
                                                            width: '100%',
                                                            maxWidth: '1000px',
                                                            height: '600px',
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
                                                    <button className="action-button action-button--accent" onClick={handlePrintReporteCitasRango} style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '34px' }}>
                                                        <Printer size={14} /> Imprimir Reporte
                                                    </button>
                                                </div>
                                            </div>
                                        </article>

                                        <article className="nurse-card span-12" style={{ borderRadius: '14px', padding: '20px' }}>
                                            {reportCitasLoading ? (
                                                <div style={{ textAlign: 'center', padding: '30px' }}>Cargando citas para el reporte...</div>
                                            ) : reportCitasList.length === 0 ? (
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
                                                                <th>Motivo</th>
                                                                <th style={{ textAlign: 'center' }}>Estado</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {reportCitasList.map((cita) => {
                                                                const pIdent = cita.paciente?.datos_identificacion || cita.paciente?.datosIdentificacion || {};
                                                                const patientName = `${pIdent.primer_nombre || ''} ${pIdent.apellido_paterno || ''}`.trim() || cita.paciente?.name || '—';
                                                                const cedula = pIdent.numero_cedula || '—';
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
                                                                        <td>{cita.motivo || 'Consulta General'}</td>
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
                                                    <button className="action-button action-button--accent" onClick={handlePrintGeneralReport} disabled={genReportLoading || !genReportData} style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '34px' }}>
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
                                                        <span style={{ color: '#fff', fontSize: '12.5px', fontWeight: 600 }}>Informe_Estadistico_Mensual.pdf</span>
                                                        <span style={{ color: '#94a3b8', fontSize: '10px' }}>Vista previa del documento oficial para impresión</span>
                                                    </div>
                                                </div>
                                                <button
                                                    className="action-button action-button--accent"
                                                    onClick={handlePrintGeneralReport}
                                                    disabled={!genReportData}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '32px', fontSize: '11.5px', borderRadius: '8px', padding: '0 14px' }}
                                                >
                                                    <Printer size={14} /> Imprimir / Descargar
                                                </button>
                                            </div>
                                            <div style={{ background: '#334155', padding: '20px', display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
                                                {genReportLoading ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '500px', color: '#fff', gap: '12px' }}>
                                                        <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #fff', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
                                                        <span>Compilando informe...</span>
                                                    </div>
                                                ) : !genReportData ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '500px', color: '#94a3b8' }}>
                                                        No hay datos disponibles para la fecha seleccionada.
                                                    </div>
                                                ) : (
                                                    <iframe
                                                        title="Informe General"
                                                        srcDoc={compileGeneralReportHtmlString(genReportData)}
                                                        style={{
                                                            width: '100%',
                                                            maxWidth: '850px',
                                                            height: '600px',
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
                            </div>
                        )}

                        {/* PESTAÑA 6: GESTIÓN DE CITAS */}
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
            {isPatientSearchOpen && createPortal(
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
                </div>,
                document.body
            )}

            {isPatientRegisterOpen && createPortal(
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
                                            className="email-addon-input"
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

                                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', color: '#0369a1', fontSize: '12.5px', marginTop: '10px' }}>
                                    <Info size={20} style={{ flexShrink: 0, color: '#0284c7' }} />
                                    <span>Se generará automáticamente una contraseña temporal para el paciente y se le enviará un correo electrónico con sus credenciales de acceso al portal.</span>
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
                </div>,
                document.body
            )}

            {/* MODAL GLOBAL: FORMULARIO DE FICHA CLÍNICA & ANAMNESIS */}
            {isFichaModalOpen && createPortal(
                <div className="clinical-modal show">
                    <div className="clinical-modal__backdrop" onClick={handleCancelFicha}></div>
                    <section className="clinical-modal__dialog">
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar">FO</span>
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
                                                <div>
                                                    <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={16} /> 1. Motivo de Consulta y Antecedentes Médicos</h3>
                                                    <div className="field field--full">
                                                        <span>Motivo de Consulta *</span>
                                                        <textarea
                                                            value={fichaForm.detalle_motivo}
                                                            onChange={(e) => setFichaForm({ ...fichaForm, detalle_motivo: e.target.value })}
                                                            placeholder="Escriba el motivo principal de la consulta dental..."
                                                            rows={2}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="clinical-fields-grid" style={{ marginTop: '12px' }}>
                                                        <div className="field">
                                                            <span>Última visita al dentista</span>
                                                            <input
                                                                type="date"
                                                                max={getLocalDateString()}
                                                                value={fichaForm.ultima_visita_fecha}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    const today = getLocalDateString();
                                                                    if (val && val > today) {
                                                                        showSystemToast("La fecha de última visita no puede ser posterior a la fecha actual.");
                                                                        setFichaForm({ ...fichaForm, ultima_visita_fecha: today });
                                                                    } else {
                                                                        setFichaForm({ ...fichaForm, ultima_visita_fecha: val });
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="field">
                                                            <span>¿Ha recibido algún tratamiento médico?</span>
                                                            <select
                                                                value={fichaForm.algun_tratamiento}
                                                                onChange={(e) => setFichaForm({ ...fichaForm, algun_tratamiento: e.target.value })}
                                                            >
                                                                <option value="no">No</option>
                                                                <option value="si">Sí</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    {fichaForm.algun_tratamiento === 'si' && (
                                                        <div className="field field--full" style={{ marginTop: '12px' }}>
                                                            <span>Detalle del tratamiento médico</span>
                                                            <textarea
                                                                value={fichaForm.detalle_tratamiento}
                                                                onChange={(e) => setFichaForm({ ...fichaForm, detalle_tratamiento: e.target.value })}
                                                                placeholder="Describa el tratamiento médico recibido..."
                                                                rows={2}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="clinical-fields-grid" style={{ marginTop: '12px' }}>
                                                        <div className="field">
                                                            <span>¿Toma algún medicamento actualmente?</span>
                                                            <select
                                                                value={fichaForm.algun_medicamento}
                                                                onChange={(e) => setFichaForm({ ...fichaForm, algun_medicamento: e.target.value })}
                                                            >
                                                                <option value="no">No</option>
                                                                <option value="si">Sí</option>
                                                            </select>
                                                        </div>
                                                        {fichaForm.algun_medicamento === 'si' && (
                                                            <div className="field">
                                                                <span>Detalle del medicamento</span>
                                                                <input
                                                                    type="text"
                                                                    value={fichaForm.detalle_medicamento}
                                                                    onChange={(e) => setFichaForm({ ...fichaForm, detalle_medicamento: e.target.value })}
                                                                    placeholder="Nombre y dosis de los medicamentos..."
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {currentStepIndex === 1 && (
                                                <div>
                                                    <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Stethoscope size={16} /> 2. Examen Estomatológico (Tejidos Blandos)</h3>

                                                    <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <CheckCircle size={20} color="var(--success)" />
                                                            <div>
                                                                <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block' }}>Evaluación Estomatológica</strong>
                                                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                                                    {hasCustomParametros
                                                                        ? 'Se detectan parámetros clínicos modificados o con hallazgos.'
                                                                        : 'Todos los tejidos (Piel, Labios, Carrillos, Paladar, Lengua, ATM, Maxilares) están marcados como Normales por defecto.'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#ffffff', padding: '8px 14px', borderRadius: '8px', border: '1.5px solid var(--primary)', fontSize: '12px', fontWeight: '600', color: 'var(--primary)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={showCustomParametros || hasCustomParametros}
                                                                onChange={(e) => {
                                                                    const isChecked = e.target.checked;
                                                                    setShowCustomParametros(isChecked);
                                                                    if (!isChecked) {
                                                                        setFichaForm(prev => ({
                                                                            ...prev,
                                                                            piel: 'normal',
                                                                            labios: 'normal',
                                                                            carrillos: 'normal',
                                                                            paladar: 'normal',
                                                                            piso_de_la_boca: 'normal',
                                                                            lengua: 'normal',
                                                                            glándulas_salivales: 'normal',
                                                                            ganglios: 'normal',
                                                                            tejido_muscular: 'normal',
                                                                            atm: 'normal',
                                                                            maxilar_superior: 'normal',
                                                                            maxilar_inferior: 'normal'
                                                                        }));
                                                                    }
                                                                }}
                                                            />
                                                            Revisar / Modificar Parámetros
                                                        </label>
                                                    </div>

                                                    {(showCustomParametros || hasCustomParametros) && (
                                                        <div className="mental-status-grid" style={{ marginBottom: '16px', background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                                            <div className="field">
                                                                <span>Piel</span>
                                                                <select value={fichaForm.piel} onChange={(e) => setFichaForm({ ...fichaForm, piel: e.target.value })}>
                                                                    <option value="normal">Normal</option>
                                                                    <option value="alterado">Alterado / Lesión</option>
                                                                </select>
                                                            </div>
                                                            <div className="field">
                                                                <span>Labios</span>
                                                                <select value={fichaForm.labios} onChange={(e) => setFichaForm({ ...fichaForm, labios: e.target.value })}>
                                                                    <option value="normal">Normal</option>
                                                                    <option value="alterado">Alterado / Lesión</option>
                                                                </select>
                                                            </div>
                                                            <div className="field">
                                                                <span>Carrillos / Mejillas</span>
                                                                <select value={fichaForm.carrillos} onChange={(e) => setFichaForm({ ...fichaForm, carrillos: e.target.value })}>
                                                                    <option value="normal">Normal</option>
                                                                    <option value="alterado">Alterado</option>
                                                                </select>
                                                            </div>
                                                            <div className="field">
                                                                <span>Paladar</span>
                                                                <select value={fichaForm.paladar} onChange={(e) => setFichaForm({ ...fichaForm, paladar: e.target.value })}>
                                                                    <option value="normal">Normal</option>
                                                                    <option value="alterado">Alterado / Lesión</option>
                                                                </select>
                                                            </div>
                                                            <div className="field">
                                                                <span>Piso de la Boca</span>
                                                                <select value={fichaForm.piso_de_la_boca} onChange={(e) => setFichaForm({ ...fichaForm, piso_de_la_boca: e.target.value })}>
                                                                    <option value="normal">Normal</option>
                                                                    <option value="alterado">Alterado</option>
                                                                </select>
                                                            </div>
                                                            <div className="field">
                                                                <span>Lengua</span>
                                                                <select value={fichaForm.lengua} onChange={(e) => setFichaForm({ ...fichaForm, lengua: e.target.value })}>
                                                                    <option value="normal">Normal</option>
                                                                    <option value="saburral">Saburral</option>
                                                                    <option value="lesion">Lesión</option>
                                                                </select>
                                                            </div>
                                                            <div className="field">
                                                                <span>Glándulas Salivales</span>
                                                                <select value={fichaForm.glándulas_salivales} onChange={(e) => setFichaForm({ ...fichaForm, glándulas_salivales: e.target.value })}>
                                                                    <option value="normal">Normal</option>
                                                                    <option value="alterado">Alterado</option>
                                                                </select>
                                                            </div>
                                                            <div className="field">
                                                                <span>Ganglios</span>
                                                                <select value={fichaForm.ganglios} onChange={(e) => setFichaForm({ ...fichaForm, ganglios: e.target.value })}>
                                                                    <option value="normal">Normal</option>
                                                                    <option value="alterado">Alterado</option>
                                                                </select>
                                                            </div>
                                                            <div className="field">
                                                                <span>Tejido Muscular</span>
                                                                <select value={fichaForm.tejido_muscular} onChange={(e) => setFichaForm({ ...fichaForm, tejido_muscular: e.target.value })}>
                                                                    <option value="normal">Normal</option>
                                                                    <option value="alterado">Alterado</option>
                                                                </select>
                                                            </div>
                                                            <div className="field">
                                                                <span>ATM</span>
                                                                <select value={fichaForm.atm} onChange={(e) => setFichaForm({ ...fichaForm, atm: e.target.value })}>
                                                                    <option value="normal">Normal</option>
                                                                    <option value="alterado">Alterado</option>
                                                                </select>
                                                            </div>
                                                            <div className="field">
                                                                <span>Maxilar Superior</span>
                                                                <select value={fichaForm.maxilar_superior} onChange={(e) => setFichaForm({ ...fichaForm, maxilar_superior: e.target.value })}>
                                                                    <option value="normal">Normal</option>
                                                                    <option value="alterado">Alterado</option>
                                                                </select>
                                                            </div>
                                                            <div className="field">
                                                                <span>Maxilar Inferior</span>
                                                                <select value={fichaForm.maxilar_inferior} onChange={(e) => setFichaForm({ ...fichaForm, maxilar_inferior: e.target.value })}>
                                                                    <option value="normal">Normal</option>
                                                                    <option value="alterado">Alterado</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="field field--full" style={{ marginTop: '12px' }}>
                                                        <span>Observaciones del Examen</span>
                                                        <textarea
                                                            value={fichaForm.observaciones}
                                                            onChange={(e) => setFichaForm({ ...fichaForm, observaciones: e.target.value })}
                                                            placeholder="Detalle cualquier hallazgo clínico relevante o nota sobre el examen..."
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {currentStepIndex === 2 && (
                                                <div>
                                                    <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} /> 3. Diagnóstico de Enfermedad Periodontal</h3>
                                                    <div className="clinical-fields-grid">
                                                        <div className="field">
                                                            <span>Placa Bacteriana</span>
                                                            <select value={fichaForm.placa_bacteriana} onChange={(e) => setFichaForm({ ...fichaForm, placa_bacteriana: e.target.value })}>
                                                                <option value="no">No detectable</option>
                                                                <option value="leve">Leve</option>
                                                                <option value="moderada">Moderada</option>
                                                                <option value="severa">Severa</option>
                                                            </select>
                                                        </div>
                                                        <div className="field">
                                                            <span>Cálculos Dentales</span>
                                                            <select value={fichaForm.calculos_dentales} onChange={(e) => setFichaForm({ ...fichaForm, calculos_dentales: e.target.value })}>
                                                                <option value="no">No presenta</option>
                                                                <option value="supragingivales">Supragingivales</option>
                                                                <option value="subgingivales">Subgingivales</option>
                                                                <option value="ambos">Ambos</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="clinical-fields-grid" style={{ marginTop: '12px' }}>
                                                        <div className="field">
                                                            <span>Bolsa Periodontal</span>
                                                            <select value={fichaForm.bolsa_periodontal} onChange={(e) => setFichaForm({ ...fichaForm, bolsa_periodontal: e.target.value })}>
                                                                <option value="no">No presenta</option>
                                                                <option value="leve">Leve (3-4 mm)</option>
                                                                <option value="moderada">Moderada (5-6 mm)</option>
                                                                <option value="severa">Severa (&gt;6 mm)</option>
                                                            </select>
                                                        </div>
                                                        <div className="field">
                                                            <span>Movilidad Dental</span>
                                                            <select value={fichaForm.movilidad_dental} onChange={(e) => setFichaForm({ ...fichaForm, movilidad_dental: e.target.value })}>
                                                                <option value="no">No presenta</option>
                                                                <option value="grado_1">Grado 1</option>
                                                                <option value="grado_2">Grado 2</option>
                                                                <option value="grado_3">Grado 3</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {currentStepIndex === 3 && (
                                                <div>
                                                    <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> 4. Diagnóstico Final, Tratamiento y Registro Diario</h3>
                                                    <div className="field field--full">
                                                        <span>Diagnóstico Odontológico *</span>
                                                        <textarea
                                                            value={fichaForm.detalle_diagnostico}
                                                            onChange={(e) => setFichaForm({ ...fichaForm, detalle_diagnostico: e.target.value })}
                                                            placeholder="Describa el diagnóstico clínico completo del paciente (Caries, Pulpitis, Gingivitis, etc.)...."
                                                            rows={3}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="clinical-form-section" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                                                        <div className="clinical-form-section__title" style={{ marginBottom: '15px' }}>
                                                            <ClipboardList size={22} style={{ padding: '4px', background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: '6px' }} />
                                                            <div>
                                                                <h3 style={{ fontSize: '11px', margin: 0 }}>Estadística de Jornada y Tratamiento</h3>
                                                                <p style={{ fontSize: '9px', margin: '2px 0 0', color: 'var(--text-muted)' }}>Asocia esta consulta al control de consulta diaria.</p>
                                                            </div>
                                                        </div>
                                                        <div className="clinical-fields-grid">
                                                            <div className="field">
                                                                <span>Tipo de Atención *</span>
                                                                <select value={fichaForm.tipo_atencion} onChange={(e) => setFichaForm({ ...fichaForm, tipo_atencion: e.target.value })}>
                                                                    <option value="primaria">Primaria (Consulta Inicial)</option>
                                                                    <option value="secundaria">Secundaria (Seguimiento)</option>
                                                                </select>
                                                            </div>
                                                            <div className="field">
                                                                <span>Subtipo de Atención *</span>
                                                                <select value={fichaForm.tipo_atencion2} onChange={(e) => setFichaForm({ ...fichaForm, tipo_atencion2: e.target.value })}>
                                                                    <option value="curativo">Curativo</option>
                                                                    <option value="preventivo">Preventivo</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="field" style={{ marginTop: '10px' }}>
                                                            <span>Procedimiento Dental Realizado *</span>
                                                            <select value={fichaForm.procedimiento} onChange={(e) => setFichaForm({ ...fichaForm, procedimiento: e.target.value })}>
                                                                <option value="Profilaxis">Profilaxis</option>
                                                                <option value="Fluorizacion">Fluorización</option>
                                                                <option value="Destartraje">Destartraje (Limpieza profunda)</option>
                                                                <option value="Rest. Provisional">Restauración Provisional</option>
                                                                <option value="Rest. con Resina">Restauración con Resina (Calzas)</option>
                                                                <option value="Desgaste">Desgaste selectivo</option>
                                                                <option value="Exodoncias">Exodoncia (Extracción)</option>
                                                                <option value="Receta">Receta Médica</option>
                                                                <option value="Orden de RX">Orden de Rayos X</option>
                                                                {proceduresCatalog.map(p => (
                                                                    <option key={p.id || p.nombre_procedimiento} value={p.nombre_procedimiento}>{p.nombre_procedimiento}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {currentStepIndex === 4 && (
                                                <div>
                                                    <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Activity size={16} /> 5. Registro de Odontograma de Paciente
                                                    </h3>

                                                    {/* Tarjeta de Resumen de la Última Consulta / Odontograma */}
                                                    <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Calendar size={16} color="var(--primary)" />
                                                                <strong style={{ fontSize: '12.5px', color: '#1e293b' }}>
                                                                    Última Actualización del Odontograma: {patientOdontograma?.updated_at ? new Date(patientOdontograma.updated_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : (fichaRawData.parte_diario?.fecha || 'Consulta inicial')}
                                                                </strong>
                                                            </div>
                                                            <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#334155', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>
                                                                Paciente: {selectedPatient?.nombre_completo}
                                                            </span>
                                                        </div>

                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                                                            <div>
                                                                <strong style={{ color: '#475569' }}>Diagnóstico de la Consulta: </strong>
                                                                <span style={{ color: '#0f172a', fontWeight: '600' }}>
                                                                    {fichaForm.detalle_diagnostico || fichaRawData.parte_diario?.detalle_diagnostico || fichaForm.detalle_motivo || 'Evaluación odontológica general'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <strong style={{ color: '#475569' }}>Procedimiento Asignado: </strong>
                                                                <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                                                                    {fichaForm.procedimiento || 'Profilaxis'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {odontogramaLoading ? (
                                                        <div style={{ textAlign: 'center', padding: '40px' }}><span className="spinner"></span> Cargando odontograma...</div>
                                                    ) : (
                                                        <div className="odontograma-container" style={{ border: 'none', boxShadow: 'none', padding: '0', marginTop: '0' }}>
                                                            <p style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', marginBottom: '24px' }}>
                                                                Selecciona un estado en la barra de herramientas y haz clic en la cara del diente para aplicarlo.
                                                            </p>

                                                            <div className="dentist-toolbar">
                                                                {/* Botón Sano siempre al inicio */}
                                                                <button
                                                                    className={`state-selector-btn ${selectedStateTool === 'sano' ? 'active' : ''}`}
                                                                    style={selectedStateTool === 'sano' ? { backgroundColor: '#64748b', color: '#ffffff' } : {}}
                                                                    onClick={() => setSelectedStateTool('sano')}
                                                                >
                                                                    <span className="state-color-dot" style={{ backgroundColor: '#ffffff', borderColor: '#64748b' }}></span>
                                                                    <span>Sano</span>
                                                                </button>

                                                                {/* Estados dinámicos de la base de datos */}
                                                                {odontogramaEstados.map(state => {
                                                                    const isActive = String(selectedStateTool) === String(state.id);
                                                                    const isAusente = state.nombre.toLowerCase() === 'ausente';
                                                                    const btnStyle = isActive ? { backgroundColor: state.color, color: '#ffffff', borderColor: 'transparent' } : {};
                                                                    return (
                                                                        <button
                                                                            key={state.id}
                                                                            className={`state-selector-btn ${isActive ? 'active' : ''}`}
                                                                            style={btnStyle}
                                                                            onClick={() => setSelectedStateTool(state.id)}
                                                                        >
                                                                            {isAusente ? (
                                                                                <span className="state-color-dot" style={{ borderRadius: '0', clipPath: 'polygon(20% 0%, 0% 20%, 30% 50%, 0% 80%, 20% 100%, 50% 70%, 80% 100%, 100% 80%, 70% 50%, 100% 20%, 80% 0%, 50% 30%)', backgroundColor: state.color }}></span>
                                                                            ) : (
                                                                                <span className="state-color-dot" style={{ backgroundColor: state.color }}></span>
                                                                            )}
                                                                            <span>{state.nombre}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>

                                                            <div className="odontograma-section">
                                                                <h4>Arcada Superior</h4>
                                                                <div className="odontograma-row">
                                                                    {upperRightTeeth.map(num => (
                                                                        <ToothSvg key={num} toothNum={num} />
                                                                    ))}
                                                                    <div style={{ width: '2px', background: 'var(--border)', margin: '0 10px' }} />
                                                                    {upperLeftTeeth.map(num => (
                                                                        <ToothSvg key={num} toothNum={num} />
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="odontograma-section">
                                                                <h4>Arcada Inferior</h4>
                                                                <div className="odontograma-row">
                                                                    {lowerRightTeeth.map(num => (
                                                                        <ToothSvg key={num} toothNum={num} />
                                                                    ))}
                                                                    <div style={{ width: '2px', background: 'var(--border)', margin: '0 10px' }} />
                                                                    {lowerLeftTeeth.map(num => (
                                                                        <ToothSvg key={num} toothNum={num} />
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="odontograma-legend">
                                                                <div className="legend-item">
                                                                    <span className="state-color-dot" style={{ backgroundColor: '#ffffff', borderColor: '#64748b' }}></span>
                                                                    <span>Sano</span>
                                                                </div>
                                                                {odontogramaEstados.map(state => (
                                                                    <div key={state.id} className="legend-item">
                                                                        <span className="state-color-dot" style={{ backgroundColor: state.color }}></span>
                                                                        <span>{state.nombre} {state.descripcion ? `(${state.descripcion})` : ''}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {currentStepIndex === 5 && (
                                                <div>
                                                    <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Package size={16} /> 6. Registro de Insumos y Consumos Médicos
                                                    </h3>
                                                    <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                                        Selecciona los insumos odontológicos utilizados para la atención de este paciente. El inventario en stock se reducirá automáticamente.
                                                    </p>

                                                    {/* Formulario Inline de Registro de Insumos */}
                                                    <form onSubmit={handleSaveInlineConsumo} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                                                        <div className="clinical-fields-grid" style={{ gridTemplateColumns: '2fr 1fr auto', alignItems: 'end', gap: '12px' }}>
                                                            <div className="field">
                                                                <span>Insumo del Inventario *</span>
                                                                <select
                                                                    value={inlineInsumoForm.id_insumo}
                                                                    onChange={(e) => setInlineInsumoForm({ ...inlineInsumoForm, id_insumo: e.target.value })}
                                                                    required
                                                                >
                                                                    <option value="">-- Seleccionar Insumo --</option>
                                                                    {insumosCatalogo.map(ins => (
                                                                        <option key={ins.id} value={ins.id} disabled={ins.stock <= 0}>
                                                                            {ins.nombre} (Stock disponible: {ins.stock})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="field">
                                                                <span>Cantidad Consumida *</span>
                                                                <input
                                                                    type="text"
                                                                    value={inlineInsumoForm.cantidad_gastada}
                                                                    onChange={(e) => setInlineInsumoForm({ ...inlineInsumoForm, cantidad_gastada: e.target.value })}
                                                                    placeholder="Ej: 1, 2 cartuchos"
                                                                    required
                                                                />
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <div className="liquid-round-btn-container">
                                                                    <button
                                                                        type="submit"
                                                                        className="liquid-round-btn"
                                                                        disabled={inlineInsumoLoading}
                                                                        aria-label="Registrar Consumo"
                                                                    >
                                                                        <Plus size={20} />
                                                                    </button>
                                                                    <span className="liquid-round-tooltip">
                                                                        {inlineInsumoLoading ? 'Registrando...' : 'Registrar Consumo'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </form>

                                                    {/* LISTA DE INSUMOS AGREGADOS AL PACIENTE */}
                                                    {(() => {
                                                        const todayStr = getLocalDateString();
                                                        const patientConsumos = insumosPacienteList.filter(item => {
                                                            const isSamePatient = String(item.id_usuario_paciente) === String(selectedPatient?.id_usuario || selectedPatient?.id);
                                                            if (!isSamePatient) return false;
                                                            if (sessionInsumoIds.includes(item.id)) return true;
                                                            const rawDate = item.fecha || item.created_at || '';
                                                            return String(rawDate).slice(0, 10) === todayStr;
                                                        });

                                                        return (
                                                            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                                    <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <Package size={16} color="var(--primary)" /> Insumos Agregados en esta Cita
                                                                    </h4>
                                                                    <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: '12px', fontWeight: '700', border: '1px solid #bae6fd' }}>
                                                                        {patientConsumos.length} insumo(s) registrado(s)
                                                                    </span>
                                                                </div>

                                                                {patientConsumos.length === 0 ? (
                                                                    <div style={{ textAlign: 'center', padding: '22px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '12px' }}>
                                                                        <Package size={22} color="#94a3b8" style={{ marginBottom: '6px', display: 'block', margin: '0 auto 6px' }} />
                                                                        No se han agregado insumos en esta cita aún. Selecciona un insumo arriba y haz clic en el botón <strong>+</strong> para añadirlo.
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                                                                            <thead>
                                                                                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                                                                    <th style={{ padding: '10px 14px', fontWeight: '700' }}>Insumo</th>
                                                                                    <th style={{ padding: '10px 14px', fontWeight: '700' }}>Cantidad Registrada</th>
                                                                                    <th style={{ padding: '10px 14px', fontWeight: '700' }}>Fecha / Hora</th>
                                                                                    <th style={{ padding: '10px 14px', fontWeight: '700', textAlign: 'right' }}>Acción</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {patientConsumos.map((item, idx) => {
                                                                                    const insumoNombre = item.insumo?.nombre || insumosCatalogo.find(c => String(c.id) === String(item.id_insumo))?.nombre || 'Insumo Médico';
                                                                                    const fechaStr = item.fecha || (item.created_at ? new Date(item.created_at).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' }) : 'Reciente');
                                                                                    return (
                                                                                        <tr key={item.id || idx} style={{ borderBottom: idx < patientConsumos.length - 1 ? '1px solid #f1f5f9' : 'none', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                                                                            <td style={{ padding: '10px 14px', fontWeight: '600', color: '#0f172a' }}>
                                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                    <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(11,49,85,0.08)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                                                                                        <Package size={13} />
                                                                                                    </span>
                                                                                                    <span>{insumoNombre}</span>
                                                                                                </div>
                                                                                            </td>
                                                                                            <td style={{ padding: '10px 14px', color: '#1e293b' }}>
                                                                                                <span style={{ background: '#e2e8f0', color: '#0f172a', padding: '3px 10px', borderRadius: '6px', fontWeight: '700', fontSize: '11.5px', display: 'inline-block' }}>
                                                                                                    {item.cantidad_gastada}
                                                                                                </span>
                                                                                            </td>
                                                                                            <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '11px' }}>
                                                                                                {fechaStr}
                                                                                            </td>
                                                                                            <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => handleDeleteConsumo(item.id)}
                                                                                                    title="Eliminar insumo registrado"
                                                                                                    style={{
                                                                                                        background: '#fef2f2',
                                                                                                        border: '1px solid #fca5a5',
                                                                                                        color: '#dc2626',
                                                                                                        borderRadius: '6px',
                                                                                                        padding: '4px 10px',
                                                                                                        fontSize: '11px',
                                                                                                        cursor: 'pointer',
                                                                                                        display: 'inline-flex',
                                                                                                        alignItems: 'center',
                                                                                                        gap: '4px',
                                                                                                        fontWeight: '600',
                                                                                                        transition: 'all 0.2s ease'
                                                                                                    }}
                                                                                                >
                                                                                                    <Trash2 size={13} /> Quitar
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
                                                        );
                                                    })()}

                                                    {/* Resumen Final de la Consulta */}
                                                    <div style={{ marginTop: '20px', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '16px 20px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                                                            <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <ClipboardList size={16} /> Resumen General de la Consulta
                                                            </h4>
                                                            <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '3px 10px', borderRadius: '12px', fontWeight: '600' }}>
                                                                Atención Odontológica
                                                            </span>
                                                        </div>

                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '12px' }}>
                                                            <div>
                                                                <span style={{ color: '#64748b', fontSize: '11px', display: 'block', fontWeight: '600' }}>Paciente Atendido:</span>
                                                                <strong style={{ color: '#0f172a', fontSize: '13px' }}>{selectedPatient?.nombre_completo}</strong>
                                                                <small style={{ display: 'block', color: '#64748b' }}>Cédula: {selectedPatient?.numero_cedula}</small>
                                                            </div>

                                                            <div>
                                                                <span style={{ color: '#64748b', fontSize: '11px', display: 'block', fontWeight: '600' }}>Diagnóstico Registrado:</span>
                                                                <strong style={{ color: '#0f172a', fontSize: '12.5px' }}>
                                                                    {fichaForm.detalle_diagnostico || fichaForm.detalle_motivo || 'Evaluación General'}
                                                                </strong>
                                                            </div>

                                                            <div>
                                                                <span style={{ color: '#64748b', fontSize: '11px', display: 'block', fontWeight: '600' }}>Procedimiento Realizado:</span>
                                                                <strong style={{ color: 'var(--primary)', fontSize: '12.5px' }}>
                                                                    {fichaForm.procedimiento || 'Profilaxis'}
                                                                </strong>
                                                            </div>

                                                            <div>
                                                                <span style={{ color: '#64748b', fontSize: '11px', display: 'block', fontWeight: '600' }}>Insumos Registrados:</span>
                                                                <strong style={{ color: '#0f172a', fontSize: '12.5px' }}>
                                                                    {insumosPacienteList.filter(item => String(item.id_usuario_paciente) === String(selectedPatient?.id_usuario || selectedPatient?.id)).length} insumo(s) consumido(s)
                                                                </strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {currentStepIndex === 6 && (
                                                <div>
                                                    <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Pill size={16} /> 7. Prescripción Médica y Recetario
                                                    </h3>
                                                    <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                                        Prescribe medicamentos desde el inventario de Farmacia para la atención de este paciente.
                                                    </p>

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
                                                                    placeholder="Ej: Amoxicilina 500mg"
                                                                />
                                                            </div>
                                                            <div className="field" style={{ margin: 0 }}>
                                                                <span>Dosis *</span>
                                                                <input
                                                                    type="text"
                                                                    value={prescripcionLineForm.detalle_dosis}
                                                                    onChange={(e) => setPrescripcionLineForm({ ...prescripcionLineForm, detalle_dosis: e.target.value })}
                                                                    placeholder="Ej: 1 cápsula"
                                                                />
                                                            </div>
                                                            <div className="field" style={{ margin: 0 }}>
                                                                <span>Vía de Adm. *</span>
                                                                <input
                                                                    type="text"
                                                                    value={prescripcionLineForm.detalle_via_administracion}
                                                                    onChange={(e) => setPrescripcionLineForm({ ...prescripcionLineForm, detalle_via_administracion: e.target.value })}
                                                                    placeholder="Ej: Oral"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="clinical-fields-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                                            <div className="field" style={{ margin: 0 }}>
                                                                <span>Cada (Horas) *</span>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={prescripcionLineForm.frecuencia_horas}
                                                                    onChange={(e) => setPrescripcionLineForm({ ...prescripcionLineForm, frecuencia_horas: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="field" style={{ margin: 0 }}>
                                                                <span>Durante (Días) *</span>
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

                                                        <div style={{ marginTop: '12px' }}>
                                                            <div className="field" style={{ margin: 0 }}>
                                                                <span>Indicaciones Adicionales / Observaciones</span>
                                                                <input
                                                                    type="text"
                                                                    value={prescripcionLineForm.observaciones}
                                                                    onChange={(e) => setPrescripcionLineForm({ ...prescripcionLineForm, observaciones: e.target.value })}
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
                                                                {(fichaForm.prescripcion_lineas || []).length} medicamento(s)
                                                            </span>
                                                        </div>

                                                        {(!fichaForm.prescripcion_lineas || fichaForm.prescripcion_lineas.length === 0) ? (
                                                            <div style={{ textAlign: 'center', padding: '22px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '12px' }}>
                                                                <Pill size={22} color="#94a3b8" style={{ marginBottom: '6px', display: 'block', margin: '0 auto 6px' }} />
                                                                No ha agregado medicamentos a la receta. Use el buscador o el formulario para añadir prescripciones.
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                                {(fichaForm.prescripcion_lineas || []).map((item) => (
                                                                    <div key={item.id_temp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                                                        <div>
                                                                            <strong style={{ color: '#0f172a', fontSize: '13px', display: 'block' }}>{item.detalle_medicamento}</strong>
                                                                            <span style={{ fontSize: '11.5px', color: '#475569' }}>
                                                                                {item.detalle_dosis} · Cada {item.frecuencia_horas} horas por {item.duracion_tratamiento_dias} días ({item.detalle_via_administracion})
                                                                            </span>
                                                                            {item.observaciones && (
                                                                                <small style={{ display: 'block', color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                                                                                    {item.observaciones}
                                                                                </small>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemovePrescripcionLine(item.id_temp)}
                                                                            style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
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
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button type="button" className="action-button action-button--primary" onClick={() => handleSaveAndFinish(false)} disabled={fichaSaving}>
                                                        {fichaSaving ? 'Guardando...' : 'Guardar Atención (Sin Certificado)'}
                                                    </button>
                                                    <button type="button" className="action-button action-button--accent" onClick={() => handleSaveAndFinish(true)} disabled={fichaSaving} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <FileCheck size={16} /> {fichaSaving ? 'Guardando...' : 'Guardar y Generar Certificado'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </footer>
                                </div>
                            )}
                        </div>
                    </section>
                </div>,
                document.body
            )}

            {/* TOAST DE SISTEMA */}
            <div className={`toast ${toast.show ? 'show' : ''}`}>
                <CheckCircle size={16} /> <span>{toast.message}</span>
            </div>

            {/* MODAL DE FEEDBACK DE GUARDADO DE SECCIÓN */}
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
            {confirmModal.show && createPortal(
                <div className="modal show" style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal__backdrop" onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)', zIndex: 1 }}></div>
                    <div className="modal__content" style={{ border: 'none', position: 'relative', zIndex: 10, margin: 'auto' }}>
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
                </div>,
                document.body
            )}

            {/* MODAL: REPORTE MENSUAL GENERAL DE HISTORIAL CLÍNICO (A4 PORTRAIT) */}
            {isGeneralReportModalOpen && (
                <div className="clinical-modal show" style={{ zIndex: 3000 }}>
                    <div className="clinical-modal__backdrop" onClick={() => setIsGeneralReportModalOpen(false)}></div>
                    <div className="clinical-modal__dialog" style={{ width: '95vw', maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <div className="clinical-modal__avatar" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}><FileText size={18} /></div>
                                <div>
                                    <span>Informe Estadístico Mensual</span>
                                    <h2>Reporte General de Atenciones</h2>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                {/* Selector de Mes */}
                                <select
                                    value={genReportMonth}
                                    onChange={e => {
                                        const m = parseInt(e.target.value);
                                        setGenReportMonth(m);
                                        fetchAndCompileGeneralReport(m, genReportYear);
                                    }}
                                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}
                                >
                                    {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((name, idx) => (
                                        <option key={idx} value={idx + 1} style={{ color: '#000' }}>{name}</option>
                                    ))}
                                </select>
                                {/* Selector de Año */}
                                <select
                                    value={genReportYear}
                                    onChange={e => {
                                        const y = parseInt(e.target.value);
                                        setGenReportYear(y);
                                        fetchAndCompileGeneralReport(genReportMonth, y);
                                    }}
                                    style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}
                                >
                                    {[2025, 2026, 2027, 2028, 2029].map(y => (
                                        <option key={y} value={y} style={{ color: '#000' }}>{y}</option>
                                    ))}
                                </select>
                                <button className="action-button action-button--primary" onClick={handlePrintGeneralReport} disabled={genReportLoading || !genReportData} style={{ minHeight: '34px', fontSize: '12px' }}>
                                    Imprimir
                                </button>
                                <button className="clinical-modal__close" onClick={() => setIsGeneralReportModalOpen(false)} style={{ color: '#fff' }}><X size={16} /></button>
                            </div>
                        </header>

                        <div className="clinical-modal__body" style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#f1f5f9' }}>
                            {genReportLoading ? (
                                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                    <div className="loading-spinner" style={{ margin: '0 auto 16px', width: '36px', height: '36px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                    <p>Recopilando y tabulando atenciones clínicas...</p>
                                </div>
                            ) : !genReportData ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    <p>No se encontraron datos para generar el reporte.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <style dangerouslySetInnerHTML={{
                                        __html: `
                                        .preview-sheet, .preview-sheet * {
                                            box-sizing: border-box;
                                        }
                                        .preview-sheet {
                                            background: #fff;
                                            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                                            border-radius: 6px;
                                            padding: 40px;
                                            font-family: Arial, sans-serif;
                                            color: #000;
                                            font-size: 10px;
                                            line-height: 1.4;
                                            width: 100%;
                                            max-width: 210mm;
                                            margin: 0 auto;
                                        }
                                        .preview-sheet table {
                                            width: 100%;
                                            min-width: 0 !important;
                                            border-collapse: collapse;
                                            font-size: 8px;
                                            border: 1px solid #000;
                                            margin-bottom: 12px;
                                        }
                                        .preview-sheet table th, .preview-sheet table td {
                                            border: 1px solid #000;
                                            padding: 4px;
                                            text-align: center;
                                            word-break: break-word;
                                            overflow-wrap: break-word;
                                        }
                                        .preview-sheet table th {
                                            font-weight: bold;
                                            background: #f1f5f9;
                                        }
                                        .preview-sheet .bg-gray {
                                            background-color: #f1f5f9 !important;
                                        }
                                        .preview-sheet .bg-total {
                                            background-color: #cbd5e1 !important;
                                        }
                                        .preview-sheet .left-align {
                                            text-align: left !important;
                                        }
                                        .preview-sheet .font-bold {
                                            font-weight: bold;
                                        }
                                        .preview-sheet .text-upper {
                                            text-transform: uppercase;
                                        }
                                        .preview-sheet h2 {
                                            font-size: 11px;
                                            font-weight: bold;
                                            margin-top: 15px;
                                            margin-bottom: 6px;
                                            text-transform: uppercase;
                                            border-bottom: 1px solid #000;
                                            padding-bottom: 2px;
                                        }
                                        .preview-sheet h3 {
                                            font-size: 10px;
                                            font-weight: bold;
                                            margin-top: 12px;
                                            margin-bottom: 5px;
                                            text-transform: uppercase;
                                        }
                                        .preview-sheet p, .preview-sheet li {
                                            font-size: 10px;
                                            text-align: justify;
                                            margin-bottom: 8px;
                                        }
                                        .preview-sheet .footnote-address {
                                            margin-top: 30px;
                                            font-size: 7.5px;
                                            color: #64748b;
                                            border-top: 1px solid #cbd5e1;
                                            padding-top: 6px;
                                            text-align: center;
                                        }
                                    `}} />

                                    {/* PÁGINA 1 */}
                                    <div className="preview-sheet">
                                        <div style={{ display: 'flex', border: '1px solid #000', padding: '8px', textAlign: 'center', marginBottom: '15px', alignItems: 'center' }}>
                                            <div style={{ width: '15%', fontWeight: 'bold', fontSize: '18px', color: '#003366' }}>UEB</div>
                                            <div style={{ width: '60%', fontWeight: 'bold' }}>
                                                <div style={{ fontSize: '12px' }}>Universidad Estatal de Bolívar</div>
                                                <div style={{ fontSize: '10px', color: '#b71a34' }}>Informe General - Departamento de Bienestar Universitario</div>
                                            </div>
                                            <div style={{ width: '25%', fontSize: '8px', textAlign: 'left', lineHeight: '1.3' }}>
                                                <strong>VERSIÓN:</strong> 1.0<br />
                                                <strong>DEPARTAMENTO:</strong> Bienestar Univ.<br />
                                                <strong>SISTEMA:</strong> Gestión Clínica
                                            </div>
                                        </div>

                                        <table style={{ fontSize: '9px', marginBottom: '20px' }}>
                                            <thead>
                                                <tr>
                                                    <th colSpan="6" style={{ background: '#f1f5f9' }}>Datos Generales</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ width: '20%', fontWeight: 'bold' }}>Fecha de Informe</td>
                                                    <td style={{ width: '30%' }}>{new Date().toLocaleDateString('es-ES')}</td>
                                                    <td style={{ width: '20%', fontWeight: 'bold' }}>No. De Informe</td>
                                                    <td style={{ width: '30%' }} colSpan="3">006-OD-{genReportYear}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ fontWeight: 'bold' }}>Responsable</td>
                                                    <td>{user?.name?.toUpperCase() || 'ANDREA GARCÍA LEÓN'}<br /><span style={{ fontSize: '8px', color: '#666' }}>Odontóloga de Bienestar Universitario</span></td>
                                                    <td colSpan="3" style={{ fontWeight: 'bold' }}>Contacto</td>
                                                    <td style={{ fontWeight: 'bold' }}>Cargo</td>
                                                </tr>
                                                <tr style={{ fontSize: '8px' }}>
                                                    <td></td>
                                                    <td></td>
                                                    <td>Ext. 167/168</td>
                                                    <td colSpan="2">{user?.email || 'angarcia@ueb.edu.ec'}</td>
                                                    <td>Odontóloga</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ fontWeight: 'bold' }}>Dirigido a</td>
                                                    <td>Michel Gaibor Vásquez</td>
                                                    <td colSpan="3" style={{ fontWeight: 'bold' }}>Contacto</td>
                                                    <td style={{ fontWeight: 'bold' }}>Cargo</td>
                                                </tr>
                                                <tr style={{ fontSize: '8px' }}>
                                                    <td></td>
                                                    <td></td>
                                                    <td>Ext. 167/168</td>
                                                    <td colSpan="2">sgaibor@ueb.gob.ec</td>
                                                    <td>Coordinadora</td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'left', padding: '6px' }}>
                                                        <strong>ASUNTO:</strong> Informe mensual de atenciones odontológicas del mes de {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][genReportMonth - 1].toLowerCase()}.
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <h2>1. Antecedentes</h2>
                                        <p>
                                            El Departamento de Bienestar Universitario fue concebido como un órgano de apoyo y de atención a la salud integral de toda la comunidad estudiantil, docente y administrativa de la Universidad Estatal de Bolívar. Dentro de sus principales responsabilidades, se encuentra la prestación continua de servicios médicos, odontológicos y psicológicos de alta calidad y accesibilidad.
                                        </p>
                                        <p>
                                            A través del Servicio de Odontología, se realizan mensualmente diagnósticos preventivos y curativos con la finalidad de promover el cuidado buco-dental de la población universitaria, sistematizando el registro de cada atención clínica mediante partes diarios integrados a la base de datos de Bienestar Universitario.
                                        </p>

                                        <h2>2. Actividades</h2>
                                        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
                                            <li>Promoción y educación para la salud buco-dental en estudiantes.</li>
                                            <li>Atención y diagnóstico preventivo (Examen Odontológico general).</li>
                                            <li>Atención curativa o de morbilidad (tratamiento de caries, extracciones, pulpitis, destartrajes, etc.).</li>
                                            <li>Registro digital de evolución odontológica y prescripciones en el sistema integrado.</li>
                                            <li>Planificación y control mensual de consumo de insumos del consultorio clínico.</li>
                                        </ul>

                                        <h2>3. Análisis de Resultados (Resumen de Comunidad Universitaria)</h2>
                                        <table style={{ maxWidth: '450px', marginTop: '10px' }}>
                                            <thead>
                                                <tr className="bg-gray" style={{ fontSize: '8.5px' }}>
                                                    <th style={{ textAlign: 'left', padding: '6px' }}>COMUNIDAD UNIVERSITARIA</th>
                                                    <th style={{ width: '120px', padding: '6px' }}>TOTAL ATENCIONES</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="left-align" style={{ padding: '5px' }}>ESTUDIANTES</td>
                                                    <td className="font-bold" style={{ padding: '5px', fontSize: '9px' }}>{genReportData.totalEstudiantes}</td>
                                                </tr>
                                                <tr>
                                                    <td className="left-align" style={{ padding: '5px' }}>ADMINISTRATIVOS</td>
                                                    <td className="font-bold" style={{ padding: '5px', fontSize: '9px' }}>{genReportData.totalAdministrativos}</td>
                                                </tr>
                                                <tr>
                                                    <td className="left-align" style={{ padding: '5px' }}>DOCENTES</td>
                                                    <td className="font-bold" style={{ padding: '5px', fontSize: '9px' }}>{genReportData.totalDocentes}</td>
                                                </tr>
                                                <tr className="bg-total font-bold" style={{ fontSize: '9.5px', backgroundColor: '#cbd5e1' }}>
                                                    <td className="left-align" style={{ padding: '6px' }}>TOTAL GENERAL</td>
                                                    <td style={{ padding: '6px' }}>{genReportData.totalPacientes}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <div className="footnote-address">
                                            Dirección: Av. Ernesto Che Guevara y Gabriel Secaira · Guaranda-Ecuador · Teléfono: (593) 3220 6010 EXT 1168 · www.ueb.edu.ec
                                        </div>
                                    </div>

                                    {/* PÁGINA 2: DETALLE POR CARRERAS */}
                                    <div className="preview-sheet">
                                        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '11px' }}>
                                                TABLA 1: ATENCIONES GENERALES POR FACULTAD Y CARRERA (ESTUDIANTES, ADMINISTRATIVOS, DOCENTES)
                                            </span>
                                        </div>

                                        <table style={{ border: '1.5px solid #000' }}>
                                            <thead>
                                                <tr className="bg-gray" style={{ fontSize: '8.5px' }}>
                                                    <th colSpan="3" style={{ textAlign: 'left', padding: '5px' }}>FACULTAD / CARRERA</th>
                                                    <th style={{ width: '12%' }}>HOMBRES</th>
                                                    <th style={{ width: '12%' }}>MUJERES</th>
                                                    <th style={{ width: '12%' }}>LGBTI</th>
                                                    <th style={{ width: '15%', backgroundColor: '#cbd5e1' }}>TOTAL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    let rows = [];
                                                    let isFirstRow = true;
                                                    const totalEstCareersCount = genReportData.reportingFaculties.reduce((acc, f) => acc + Object.keys(genReportData.statsByFacultyAndCareer[f]).length, 0);

                                                    genReportData.reportingFaculties.forEach(f => {
                                                        const careers = genReportData.statsByFacultyAndCareer[f];
                                                        const careerNames = Object.keys(careers);
                                                        const facCareersCount = careerNames.length;
                                                        if (facCareersCount === 0) return;

                                                        careerNames.forEach((cName, idx) => {
                                                            const stats = careers[cName];
                                                            rows.push(
                                                                <tr key={`${f}-${cName}`}>
                                                                    {isFirstRow && (
                                                                        <td
                                                                            rowSpan={totalEstCareersCount}
                                                                            style={{
                                                                                writingMode: 'vertical-lr',
                                                                                transform: 'rotate(180deg)',
                                                                                fontWeight: 'bold',
                                                                                textAlign: 'center',
                                                                                verticalAlign: 'middle',
                                                                                backgroundColor: '#f1f5f9',
                                                                                width: '25px',
                                                                                fontSize: '9px'
                                                                            }}
                                                                        >
                                                                            ESTUDIANTES
                                                                        </td>
                                                                    )}
                                                                    {idx === 0 && (
                                                                        <td
                                                                            rowSpan={facCareersCount}
                                                                            className="left-align font-bold"
                                                                            style={{ backgroundColor: '#f8fafc', verticalAlign: 'middle', fontSize: '8px', width: '140px' }}
                                                                        >
                                                                            {f}
                                                                        </td>
                                                                    )}
                                                                    <td className="left-align" style={{ fontSize: '8px' }}>{cName}</td>
                                                                    <td style={{ fontSize: '8px' }}>{stats.hombres}</td>
                                                                    <td style={{ fontSize: '8px' }}>{stats.mujeres}</td>
                                                                    <td style={{ fontSize: '8px' }}>{stats.lgbti}</td>
                                                                    <td className="font-bold bg-gray" style={{ fontSize: '8px' }}>{stats.total}</td>
                                                                </tr>
                                                            );
                                                            isFirstRow = false;
                                                        });
                                                    });

                                                    // Bottom summary rows
                                                    rows.push(
                                                        <tr key="sum-est" className="bg-gray font-bold" style={{ fontSize: '8.5px' }}>
                                                            <td colSpan="3" className="left-align">ESTUDIANTES</td>
                                                            <td>{genReportData.genderCounts.estudiantes.hombres}</td>
                                                            <td>{genReportData.genderCounts.estudiantes.mujeres}</td>
                                                            <td>{genReportData.genderCounts.estudiantes.lgbti}</td>
                                                            <td className="bg-total">{genReportData.totalEstudiantes}</td>
                                                        </tr>
                                                    );

                                                    rows.push(
                                                        <tr key="sum-adm" className="bg-gray font-bold" style={{ fontSize: '8.5px' }}>
                                                            <td colSpan="3" className="left-align">ADMINISTRATIVOS</td>
                                                            <td>{genReportData.genderCounts.administrativos.hombres}</td>
                                                            <td>{genReportData.genderCounts.administrativos.mujeres}</td>
                                                            <td>{genReportData.genderCounts.administrativos.lgbti}</td>
                                                            <td className="bg-total">{genReportData.totalAdministrativos}</td>
                                                        </tr>
                                                    );

                                                    rows.push(
                                                        <tr key="sum-doc" className="bg-gray font-bold" style={{ fontSize: '8.5px' }}>
                                                            <td colSpan="3" className="left-align">DOCENTES</td>
                                                            <td>{genReportData.genderCounts.docentes.hombres}</td>
                                                            <td>{genReportData.genderCounts.docentes.mujeres}</td>
                                                            <td>{genReportData.genderCounts.docentes.lgbti}</td>
                                                            <td className="bg-total">{genReportData.totalDocentes}</td>
                                                        </tr>
                                                    );

                                                    const totalH = genReportData.genderCounts.estudiantes.hombres + genReportData.genderCounts.administrativos.hombres + genReportData.genderCounts.docentes.hombres;
                                                    const totalM = genReportData.genderCounts.estudiantes.mujeres + genReportData.genderCounts.administrativos.mujeres + genReportData.genderCounts.docentes.mujeres;
                                                    const totalL = genReportData.genderCounts.estudiantes.lgbti + genReportData.genderCounts.administrativos.lgbti + genReportData.genderCounts.docentes.lgbti;

                                                    rows.push(
                                                        <tr key="sum-grand" className="bg-total font-bold" style={{ fontSize: '9px', backgroundColor: '#cbd5e1' }}>
                                                            <td colSpan="3" className="left-align text-upper">TOTAL</td>
                                                            <td>{totalH}</td>
                                                            <td>{totalM}</td>
                                                            <td>{totalL}</td>
                                                            <td>{genReportData.totalPacientes}</td>
                                                        </tr>
                                                    );

                                                    return rows;
                                                })()}
                                            </tbody>
                                        </table>

                                        <div className="footnote-address">
                                            Dirección: Av. Ernesto Che Guevara y Gabriel Secaira · Guaranda-Ecuador · Teléfono: (593) 3220 6010 EXT 1168 · www.ueb.edu.ec
                                        </div>
                                    </div>

                                    {/* PÁGINA 3: COMPARATIVA PREVENTIVA Y CURATIVA */}
                                    <div className="preview-sheet">
                                        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '11px' }}>
                                                TABLA 2: DISTRIBUCIÓN DE ATENCIONES PREVENTIVAS Y CURATIVAS POR FACULTAD Y CARRERA
                                            </span>
                                        </div>

                                        <table style={{ border: '1.5px solid #000' }}>
                                            <thead>
                                                <tr className="bg-gray" style={{ fontSize: '8px' }}>
                                                    <th rowSpan="2" colSpan="3" style={{ textAlign: 'left', verticalAlign: 'middle', padding: '4px' }}>FACULTAD / CARRERA</th>
                                                    <th colSpan="4" style={{ padding: '4px' }}>ODONTOLOGÍA PREVENTIVA</th>
                                                    <th colSpan="4" style={{ padding: '4px' }}>ODONTOLOGÍA CURATIVA</th>
                                                    <th rowSpan="2" style={{ verticalAlign: 'middle', backgroundColor: '#cbd5e1', padding: '4px' }}>TOTAL</th>
                                                </tr>
                                                <tr className="bg-gray" style={{ fontSize: '7.5px' }}>
                                                    <th>MASC.</th><th>FEM.</th><th>LGBTI</th><th className="font-bold">TOTAL</th>
                                                    <th>MASC.</th><th>FEM.</th><th>LGBTI</th><th className="font-bold">TOTAL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    let rows = [];
                                                    let isFirstRow = true;
                                                    const totalEstCareersCount = genReportData.reportingFaculties.reduce((acc, f) => acc + Object.keys(genReportData.statsByFacultyAndCareer[f]).length, 0);
                                                    const totalRowsSpanned2 = totalEstCareersCount + genReportData.reportingFaculties.filter(fac => Object.keys(genReportData.statsByFacultyAndCareer[fac]).length > 0).length;

                                                    genReportData.reportingFaculties.forEach(f => {
                                                        const careers = genReportData.statsByFacultyAndCareer[f];
                                                        const careerNames = Object.keys(careers);
                                                        const facCareersCount = careerNames.length;
                                                        if (facCareersCount === 0) return;

                                                        let fPrevH = 0, fPrevM = 0, fPrevL = 0, fPrevT = 0;
                                                        let fCurH = 0, fCurM = 0, fCurL = 0, fCurT = 0;
                                                        let fGrandTotal = 0;

                                                        careerNames.forEach((cName, idx) => {
                                                            const stats = careers[cName];

                                                            fPrevH += stats.preventiva.hombres;
                                                            fPrevM += stats.preventiva.mujeres;
                                                            fPrevL += stats.preventiva.lgbti;
                                                            fPrevT += stats.preventiva.total;

                                                            fCurH += stats.curativa.hombres;
                                                            fCurM += stats.curativa.mujeres;
                                                            fCurL += stats.curativa.lgbti;
                                                            fCurT += stats.curativa.total;

                                                            fGrandTotal += stats.total;

                                                            rows.push(
                                                                <tr key={`t2-${f}-${cName}`}>
                                                                    {isFirstRow && (
                                                                        <td
                                                                            rowSpan={totalRowsSpanned2}
                                                                            style={{
                                                                                writingMode: 'vertical-lr',
                                                                                transform: 'rotate(180deg)',
                                                                                fontWeight: 'bold',
                                                                                textAlign: 'center',
                                                                                verticalAlign: 'middle',
                                                                                backgroundColor: '#f1f5f9',
                                                                                width: '25px',
                                                                                fontSize: '9px'
                                                                            }}
                                                                        >
                                                                            ESTUDIANTES
                                                                        </td>
                                                                    )}
                                                                    {idx === 0 && (
                                                                        <td
                                                                            rowSpan={facCareersCount + 1}
                                                                            className="left-align font-bold"
                                                                            style={{ backgroundColor: '#f8fafc', verticalAlign: 'middle', fontSize: '8px', width: '140px' }}
                                                                        >
                                                                            {f}
                                                                        </td>
                                                                    )}
                                                                    <td className="left-align" style={{ fontSize: '8px' }}>{cName}</td>
                                                                    <td style={{ fontSize: '8px' }}>{stats.preventiva.hombres}</td>
                                                                    <td style={{ fontSize: '8px' }}>{stats.preventiva.mujeres}</td>
                                                                    <td style={{ fontSize: '8px' }}>{stats.preventiva.lgbti}</td>
                                                                    <td className="font-bold bg-gray" style={{ fontSize: '8px' }}>{stats.preventiva.total}</td>
                                                                    <td style={{ fontSize: '8px' }}>{stats.curativa.hombres}</td>
                                                                    <td style={{ fontSize: '8px' }}>{stats.curativa.mujeres}</td>
                                                                    <td style={{ fontSize: '8px' }}>{stats.curativa.lgbti}</td>
                                                                    <td className="font-bold bg-gray" style={{ fontSize: '8px' }}>{stats.curativa.total}</td>
                                                                    <td className="font-bold bg-total" style={{ fontSize: '8px' }}>{stats.total}</td>
                                                                </tr>
                                                            );
                                                            isFirstRow = false;
                                                        });

                                                        // Subtotal row for faculty
                                                        rows.push(
                                                            <tr key={`t2-sub-${f}`} className="font-bold bg-gray" style={{ fontSize: '8px' }}>
                                                                <td className="left-align">TOTAL</td>
                                                                <td>{fPrevH}</td>
                                                                <td>{fPrevM}</td>
                                                                <td>{fPrevL}</td>
                                                                <td className="bg-total">{fPrevT}</td>
                                                                <td>{fCurH}</td>
                                                                <td>{fCurM}</td>
                                                                <td>{fCurL}</td>
                                                                <td className="bg-total">{fCurT}</td>
                                                                <td className="bg-total">{fGrandTotal}</td>
                                                            </tr>
                                                        );
                                                    });

                                                    // Bottom Rows (Estudiantes, Administrativos, Docentes, Grand Total)
                                                    let estPrevH = 0, estPrevM = 0, estPrevL = 0, estPrevT = 0;
                                                    let estCurH = 0, estCurM = 0, estCurL = 0, estCurT = 0;
                                                    let estGrandT = 0;

                                                    genReportData.reportingFaculties.forEach(f => {
                                                        const careers = genReportData.statsByFacultyAndCareer[f];
                                                        Object.keys(careers).forEach(cName => {
                                                            const stats = careers[cName];
                                                            estPrevH += stats.preventiva.hombres;
                                                            estPrevM += stats.preventiva.mujeres;
                                                            estPrevL += stats.preventiva.lgbti;
                                                            estPrevT += stats.preventiva.total;
                                                            estCurH += stats.curativa.hombres;
                                                            estCurM += stats.curativa.mujeres;
                                                            estCurL += stats.curativa.lgbti;
                                                            estCurT += stats.curativa.total;
                                                            estGrandT += stats.total;
                                                        });
                                                    });

                                                    const admPrevH = genReportData.consolidadoStats.preventivo['Examen Odontológico'].administrativos.hombres;
                                                    const admPrevM = genReportData.consolidadoStats.preventivo['Examen Odontológico'].administrativos.mujeres;
                                                    const admPrevL = genReportData.consolidadoStats.preventivo['Examen Odontológico'].administrativos.lgbti;
                                                    const admPrevT = genReportData.consolidadoStats.preventivo['Examen Odontológico'].administrativos.total;

                                                    let admCurH = 0, admCurM = 0, admCurL = 0, admCurT = 0;
                                                    genReportData.curativosDiagnoses.forEach(diag => {
                                                        const r = genReportData.consolidadoStats.curativo[diag].administrativos;
                                                        admCurH += r.hombres;
                                                        admCurM += r.mujeres;
                                                        admCurL += r.lgbti;
                                                        admCurT += r.total;
                                                    });

                                                    const docPrevH = genReportData.consolidadoStats.preventivo['Examen Odontológico'].docentes.hombres;
                                                    const docPrevM = genReportData.consolidadoStats.preventivo['Examen Odontológico'].docentes.mujeres;
                                                    const docPrevL = genReportData.consolidadoStats.preventivo['Examen Odontológico'].docentes.lgbti;
                                                    const docPrevT = genReportData.consolidadoStats.preventivo['Examen Odontológico'].docentes.total;

                                                    let docCurH = 0, docCurM = 0, docCurL = 0, docCurT = 0;
                                                    genReportData.curativosDiagnoses.forEach(diag => {
                                                        const r = genReportData.consolidadoStats.curativo[diag].docentes;
                                                        docCurH += r.hombres;
                                                        docCurM += r.mujeres;
                                                        docCurL += r.lgbti;
                                                        docCurT += r.total;
                                                    });

                                                    rows.push(
                                                        <tr key="t2-sum-est" className="bg-gray font-bold" style={{ fontSize: '8px' }}>
                                                            <td colSpan="3" className="left-align">ESTUDIANTES</td>
                                                            <td>{estPrevH}</td><td>{estPrevM}</td><td>{estPrevL}</td><td className="bg-total">{estPrevT}</td>
                                                            <td>{estCurH}</td><td>{estCurM}</td><td>{estCurL}</td><td className="bg-total">{estCurT}</td>
                                                            <td className="bg-total">{estGrandT}</td>
                                                        </tr>
                                                    );

                                                    rows.push(
                                                        <tr key="t2-sum-adm" className="bg-gray font-bold" style={{ fontSize: '8px' }}>
                                                            <td colSpan="3" className="left-align">ADMINISTRATIVOS</td>
                                                            <td>{admPrevH}</td><td>{admPrevM}</td><td>{admPrevL}</td><td className="bg-total">{admPrevT}</td>
                                                            <td>{admCurH}</td><td>{admCurM}</td><td>{admCurL}</td><td className="bg-total">{admCurT}</td>
                                                            <td className="bg-total">{admPrevT + admCurT}</td>
                                                        </tr>
                                                    );

                                                    rows.push(
                                                        <tr key="t2-sum-doc" className="bg-gray font-bold" style={{ fontSize: '8px' }}>
                                                            <td colSpan="3" className="left-align">DOCENTES</td>
                                                            <td>{docPrevH}</td><td>{docPrevM}</td><td>{docPrevL}</td><td className="bg-total">{docPrevT}</td>
                                                            <td>{docCurH}</td><td>{docCurM}</td><td>{docCurL}</td><td className="bg-total">{docCurT}</td>
                                                            <td className="bg-total">{docPrevT + docCurT}</td>
                                                        </tr>
                                                    );

                                                    const gPrevH = estPrevH + admPrevH + docPrevH;
                                                    const gPrevM = estPrevM + admPrevM + docPrevM;
                                                    const gPrevL = estPrevL + admPrevL + docPrevL;
                                                    const gPrevT = estPrevT + admPrevT + docPrevT;
                                                    const gCurH = estCurH + admCurH + docCurH;
                                                    const gCurM = estCurM + admCurM + docCurM;
                                                    const gCurL = estCurL + admCurL + docCurL;
                                                    const gCurT = estCurT + admCurT + docCurT;

                                                    rows.push(
                                                        <tr key="t2-sum-grand" className="bg-total font-bold" style={{ fontSize: '9px', backgroundColor: '#cbd5e1' }}>
                                                            <td colSpan="3" className="left-align text-upper">TOTAL</td>
                                                            <td>{gPrevH}</td><td>{gPrevM}</td><td>{gPrevL}</td><td>{gPrevT}</td>
                                                            <td>{gCurH}</td><td>{gCurM}</td><td>{gCurL}</td><td>{gCurT}</td>
                                                            <td style={{ backgroundColor: '#94a3b8', color: '#fff' }}>{gPrevT + gCurT}</td>
                                                        </tr>
                                                    );

                                                    return rows;
                                                })()}
                                            </tbody>
                                        </table>

                                        <div className="footnote-address">
                                            Dirección: Av. Ernesto Che Guevara y Gabriel Secaira · Guaranda-Ecuador · Teléfono: (593) 3220 6010 EXT 1168 · www.ueb.edu.ec
                                        </div>
                                    </div>

                                    {/* PÁGINA 4: CONSOLIDADO DE DIAGNÓSTICOS */}
                                    <div className="preview-sheet">
                                        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '11px' }}>
                                                TABLA 3: CONSOLIDADO DE ATENCIONES PREVENTIVAS Y CURATIVAS POR TIPO DE USUARIO
                                            </span>
                                        </div>

                                        <table style={{ border: '1.5px solid #000' }}>
                                            <thead>
                                                <tr className="bg-gray" style={{ fontSize: '8px' }}>
                                                    <th rowSpan="2" style={{ textAlign: 'left', verticalAlign: 'middle', padding: '5px', width: '35%' }}>PREVENCIÓN / MORBILIDAD</th>
                                                    <th colSpan="4" style={{ padding: '4px' }}>ESTUDIANTES</th>
                                                    <th colSpan="4" style={{ padding: '4px' }}>ADMINISTRATIVOS</th>
                                                    <th colSpan="4" style={{ padding: '4px' }}>DOCENTES</th>
                                                    <th rowSpan="2" style={{ verticalAlign: 'middle', backgroundColor: '#cbd5e1', padding: '4px', width: '8%' }}>TOTAL</th>
                                                </tr>
                                                <tr className="bg-gray" style={{ fontSize: '7.5px' }}>
                                                    <th>M.</th><th>F.</th><th>L.</th><th className="font-bold">T.</th>
                                                    <th>M.</th><th>F.</th><th>L.</th><th className="font-bold">T.</th>
                                                    <th>M.</th><th>F.</th><th>L.</th><th className="font-bold">T.</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    let rows = [];
                                                    const pExamen = genReportData.consolidadoStats.preventivo['Examen Odontológico'];

                                                    // Prevención section
                                                    rows.push(
                                                        <tr key="t3-prev-head" style={{ backgroundColor: '#fed7aa', fontWeight: 'bold', textAlign: 'left', fontSize: '8px' }}>
                                                            <td colSpan="14" className="left-align" style={{ padding: '4px' }}>PREVENCION</td>
                                                        </tr>
                                                    );
                                                    rows.push(
                                                        <tr key="t3-prev-ex">
                                                            <td className="left-align font-bold" style={{ fontSize: '8px', padding: '4px' }}>Examen Odontológico</td>
                                                            <td>{pExamen.estudiantes.hombres}</td><td>{pExamen.estudiantes.mujeres}</td><td>{pExamen.estudiantes.lgbti}</td><td className="font-bold bg-gray">{pExamen.estudiantes.total}</td>
                                                            <td>{pExamen.administrativos.hombres}</td><td>{pExamen.administrativos.mujeres}</td><td>{pExamen.administrativos.lgbti}</td><td className="font-bold bg-gray">{pExamen.administrativos.total}</td>
                                                            <td>{pExamen.docentes.hombres}</td><td>{pExamen.docentes.mujeres}</td><td>{pExamen.docentes.lgbti}</td><td className="font-bold bg-gray">{pExamen.docentes.total}</td>
                                                            <td className="bg-total font-bold">{pExamen.estudiantes.total + pExamen.administrativos.total + pExamen.docentes.total}</td>
                                                        </tr>
                                                    );

                                                    // Curativo section
                                                    rows.push(
                                                        <tr key="t3-cur-head" style={{ backgroundColor: '#ffedd5', fontWeight: 'bold', textAlign: 'left', fontSize: '8px' }}>
                                                            <td colSpan="14" className="left-align" style={{ padding: '4px' }}>CURATIVO</td>
                                                        </tr>
                                                    );

                                                    let estH = 0, estM = 0, estL = 0, estT = 0;
                                                    let admH = 0, admM = 0, admL = 0, admT = 0;
                                                    let docH = 0, docM = 0, docL = 0, docT = 0;

                                                    genReportData.curativosDiagnoses.forEach(diag => {
                                                        const r = genReportData.consolidadoStats.curativo[diag];

                                                        estH += r.estudiantes.hombres;
                                                        estM += r.estudiantes.mujeres;
                                                        estL += r.estudiantes.lgbti;
                                                        estT += r.estudiantes.total;

                                                        admH += r.administrativos.hombres;
                                                        admM += r.administrativos.mujeres;
                                                        admL += r.administrativos.lgbti;
                                                        admT += r.administrativos.total;

                                                        docH += r.docentes.hombres;
                                                        docM += r.docentes.mujeres;
                                                        docL += r.docentes.lgbti;
                                                        docT += r.docentes.total;

                                                        const rowGrand = r.estudiantes.total + r.administrativos.total + r.docentes.total;

                                                        rows.push(
                                                            <tr key={`t3-cur-${diag}`}>
                                                                <td className="left-align font-bold" style={{ fontSize: '8px', padding: '4px' }}>{diag}</td>
                                                                <td>{r.estudiantes.hombres || ''}</td>
                                                                <td>{r.estudiantes.mujeres || ''}</td>
                                                                <td>{r.estudiantes.lgbti || ''}</td>
                                                                <td className="font-bold bg-gray">{r.estudiantes.total || '0'}</td>
                                                                <td>{r.administrativos.hombres || ''}</td>
                                                                <td>{r.administrativos.mujeres || ''}</td>
                                                                <td>{r.administrativos.lgbti || ''}</td>
                                                                <td className="font-bold bg-gray">{r.administrativos.total || '0'}</td>
                                                                <td>{r.docentes.hombres || ''}</td>
                                                                <td>{r.docentes.mujeres || ''}</td>
                                                                <td>{r.docentes.lgbti || ''}</td>
                                                                <td className="font-bold bg-gray">{r.docentes.total || '0'}</td>
                                                                <td className="bg-total font-bold">{rowGrand}</td>
                                                            </tr>
                                                        );
                                                    });

                                                    const finalEstH = pExamen.estudiantes.hombres + estH;
                                                    const finalEstM = pExamen.estudiantes.mujeres + estM;
                                                    const finalEstL = pExamen.estudiantes.lgbti + estL;
                                                    const finalEstT = pExamen.estudiantes.total + estT;

                                                    const finalAdmH = pExamen.administrativos.hombres + admH;
                                                    const finalAdmM = pExamen.administrativos.mujeres + admM;
                                                    const finalAdmL = pExamen.administrativos.lgbti + admL;
                                                    const finalAdmT = pExamen.administrativos.total + admT;

                                                    const finalDocH = pExamen.docentes.hombres + docH;
                                                    const finalDocM = pExamen.docentes.mujeres + docM;
                                                    const finalDocL = pExamen.docentes.lgbti + docL;
                                                    const finalDocT = pExamen.docentes.total + docT;

                                                    const overallGrandTotal = finalEstT + finalAdmT + finalDocT;

                                                    rows.push(
                                                        <tr key="t3-final-total" className="bg-total font-bold" style={{ fontSize: '8.5px', backgroundColor: '#cbd5e1' }}>
                                                            <td className="left-align" style={{ padding: '4px' }}>TOTAL</td>
                                                            <td>{finalEstH}</td>
                                                            <td>{finalEstM}</td>
                                                            <td>{finalEstL}</td>
                                                            <td>{finalEstT}</td>
                                                            <td>{finalAdmH}</td>
                                                            <td>{finalAdmM}</td>
                                                            <td>{finalAdmL}</td>
                                                            <td>{finalAdmT}</td>
                                                            <td>{finalDocH}</td>
                                                            <td>{finalDocM}</td>
                                                            <td>{finalDocL}</td>
                                                            <td>{finalDocT}</td>
                                                            <td style={{ backgroundColor: '#94a3b8', color: '#fff' }}>{overallGrandTotal}</td>
                                                        </tr>
                                                    );

                                                    return rows;
                                                })()}
                                            </tbody>
                                        </table>

                                        <div className="footnote-address">
                                            Dirección: Av. Ernesto Che Guevara y Gabriel Secaira · Guaranda-Ecuador · Teléfono: (593) 3220 6010 EXT 1168 · www.ueb.edu.ec
                                        </div>
                                    </div>

                                    {/* PÁGINAS 5+: FICHAS ESTADÍSTICAS INDIVIDUALES POR CARRERA */}
                                    {(() => {
                                        const renderSingleCareerReactTable = (careerName) => {
                                            const cStats = genReportData.careerIndividualStats[careerName];
                                            const pVal = cStats.preventivo['Examen Odontológico'];

                                            let curH = 0, curM = 0, curL = 0, curT = 0;

                                            return (
                                                <div key={careerName}>
                                                    <table className="report-table" style={{ fontSize: '8px', borderCollapse: 'collapse', width: '100%', border: '1px solid #000', marginBottom: '5px' }}>
                                                        <thead>
                                                            <tr>
                                                                <td style={{ width: '15%', fontWeight: 'bold', fontSize: '10px', textAlign: 'center', border: '1px solid #000', padding: '4px' }}>
                                                                    UEB
                                                                </td>
                                                                <td colSpan="3" style={{ width: '60%', fontWeight: 'bold', textAlign: 'center', fontSize: '9px', border: '1px solid #000', padding: '4px' }}>
                                                                    UNIVERSIDAD ESTATAL DE BOLÍVAR<br />
                                                                    BIENESTAR UNIVERSITARIO
                                                                </td>
                                                                <td style={{ width: '25%', fontWeight: 'bold', textAlign: 'center', fontSize: '8px', border: '1px solid #000', padding: '4px' }}>
                                                                    BIENESTAR UNIVERSITARIO
                                                                </td>
                                                            </tr>
                                                            <tr style={{ backgroundColor: '#cbd5e1', fontWeight: 'bold' }}>
                                                                <td colSpan="5" style={{ textAlign: 'center', fontSize: '9px', padding: '4px', border: '1px solid #000', textTransform: 'uppercase' }}>
                                                                    ATENCIONES DE ODONTOLOGÍA - {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][genReportMonth - 1].toUpperCase()} {genReportYear}
                                                                </td>
                                                            </tr>
                                                            <tr style={{ fontWeight: 'bold' }}>
                                                                <td style={{ textAlign: 'left', backgroundColor: '#d1fae5', fontSize: '8.5px', padding: '4px', border: '1px solid #000', textTransform: 'uppercase', width: '50%' }}>
                                                                    {careerName}
                                                                </td>
                                                                <td colSpan="4" style={{ textAlign: 'center', backgroundColor: '#ffedd5', fontSize: '8.5px', padding: '4px', border: '1px solid #000' }}>
                                                                    ESTUDIANTES
                                                                </td>
                                                            </tr>
                                                            <tr style={{ backgroundColor: '#cbd5e1', textLeft: 'left', fontWeight: 'bold' }}>
                                                                <th className="left-align" style={{ fontSize: '8px', padding: '4px', border: '1px solid #000', width: '50%' }}>PREVENCION</th>
                                                                <th style={{ fontSize: '8px', padding: '4px', textAlign: 'center', width: '12%', border: '1px solid #000' }}>MASCULINO</th>
                                                                <th style={{ fontSize: '8px', padding: '4px', textAlign: 'center', width: '12%', border: '1px solid #000' }}>FEMENINO</th>
                                                                <th style={{ fontSize: '8px', padding: '4px', textAlign: 'center', width: '12%', border: '1px solid #000' }}>LGBTI</th>
                                                                <th style={{ fontSize: '8px', padding: '4px', textAlign: 'center', width: '14%', border: '1px solid #000' }}>TOTAL</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td className="left-align font-bold" style={{ border: '1px solid #000', fontSize: '7.5px', padding: '3px' }}>Examen Odontológico</td>
                                                                <td style={{ border: '1px solid #000', fontSize: '7.5px', padding: '3px', textAlign: 'center' }}>{pVal.hombres || ''}</td>
                                                                <td style={{ border: '1px solid #000', fontSize: '7.5px', padding: '3px', textAlign: 'center' }}>{pVal.mujeres || ''}</td>
                                                                <td style={{ border: '1px solid #000', fontSize: '7.5px', padding: '3px', textAlign: 'center' }}>{pVal.lgbti || ''}</td>
                                                                <td className="font-bold bg-gray" style={{ border: '1px solid #000', fontSize: '7.5px', padding: '3px', textAlign: 'center' }}>{pVal.total || '0'}</td>
                                                            </tr>
                                                            <tr style={{ backgroundColor: '#cbd5e1', fontWeight: 'bold', textAlign: 'left' }}>
                                                                <td className="left-align" style={{ fontSize: '8px', padding: '4px', border: '1px solid #000' }}>CURATIVO</td>
                                                                <td style={{ fontSize: '8px', padding: '4px', textAlign: 'center', border: '1px solid #000' }}>MASCULINO</td>
                                                                <td style={{ fontSize: '8px', padding: '4px', textAlign: 'center', border: '1px solid #000' }}>FEMENINO</td>
                                                                <td style={{ fontSize: '8px', padding: '4px', textAlign: 'center', border: '1px solid #000' }}>LGBTI</td>
                                                                <td style={{ fontSize: '8px', padding: '4px', textAlign: 'center', border: '1px solid #000' }}>TOTAL</td>
                                                            </tr>
                                                            {genReportData.curativosDiagnoses.map(diag => {
                                                                const r = cStats.curativo[diag];
                                                                curH += r.hombres;
                                                                curM += r.mujeres;
                                                                curL += r.lgbti;
                                                                curT += r.total;
                                                                return (
                                                                    <tr key={diag}>
                                                                        <td className="left-align font-bold" style={{ border: '1px solid #000', fontSize: '7.5px', padding: '3px' }}>{diag}</td>
                                                                        <td style={{ border: '1px solid #000', fontSize: '7.5px', padding: '3px', textAlign: 'center' }}>{r.hombres || ''}</td>
                                                                        <td style={{ border: '1px solid #000', fontSize: '7.5px', padding: '3px', textAlign: 'center' }}>{r.mujeres || ''}</td>
                                                                        <td style={{ border: '1px solid #000', fontSize: '7.5px', padding: '3px', textAlign: 'center' }}>{r.lgbti || ''}</td>
                                                                        <td className="font-bold bg-gray" style={{ border: '1px solid #000', fontSize: '7.5px', padding: '3px', textAlign: 'center' }}>{r.total || '0'}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                            <tr className="bg-total font-bold" style={{ fontSize: '8px', backgroundColor: '#cbd5e1' }}>
                                                                <td className="left-align" style={{ padding: '4px', border: '1px solid #000' }}>TOTAL</td>
                                                                <td style={{ border: '1px solid #000', textAlign: 'center' }}>{pVal.hombres + curH}</td>
                                                                <td style={{ border: '1px solid #000', textAlign: 'center' }}>{pVal.mujeres + curM}</td>
                                                                <td style={{ border: '1px solid #000', textAlign: 'center' }}>{pVal.lgbti + curL}</td>
                                                                <td style={{ border: '1px solid #000', textAlign: 'center' }}>{pVal.total + curT}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    <div style={{ fontSize: '9px', textAlign: 'right', marginRight: '5px', fontWeight: 'bold', color: '#000', marginBottom: '15px' }}>
                                                        TOTAL PACIENTES: {pVal.total + curT}
                                                    </div>
                                                </div>
                                            );
                                        };

                                        const activeCareers = Object.keys(genReportData.careerIndividualStats).sort();
                                        if (activeCareers.length === 0) {
                                            return (
                                                <div className="preview-sheet">
                                                    <p style={{ fontStyle: 'italic', color: '#666', textAlign: 'center' }}>No se registraron atenciones a estudiantes de carreras específicas este mes.</p>
                                                    <div className="footnote-address">
                                                        Dirección: Av. Ernesto Che Guevara y Gabriel Secaira · Guaranda-Ecuador · Teléfono: (593) 3220 6010 EXT 1168 · www.ueb.edu.ec
                                                    </div>
                                                </div>
                                            );
                                        }

                                        let sheets = [];
                                        for (let i = 0; i < activeCareers.length; i += 2) {
                                            const cNameA = activeCareers[i];
                                            const cNameB = activeCareers[i + 1];

                                            sheets.push(
                                                <div key={`sheet-career-${i}`} className="preview-sheet">
                                                    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                                        <span style={{ fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }}>
                                                            FICHA ESTADÍSTICA DE ATENCIONES ODONTOLÓGICAS POR CARRERA
                                                        </span>
                                                    </div>
                                                    {renderSingleCareerReactTable(cNameA)}
                                                    {cNameB && (
                                                        <>
                                                            <div style={{ margin: '25px 0', borderTop: '1px dashed #cbd5e1', paddingTop: '15px' }}></div>
                                                            {renderSingleCareerReactTable(cNameB)}
                                                        </>
                                                    )}
                                                    <div className="footnote-address">
                                                        Dirección: Av. Ernesto Che Guevara y Gabriel Secaira · Guaranda-Ecuador · Teléfono: (593) 3220 6010 EXT 1168 · www.ueb.edu.ec
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return sheets;
                                    })()}

                                    {/* PÁGINA DE PROCEDIMIENTOS Y ANEXOS */}
                                    <div className="preview-sheet">
                                        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '11px' }}>
                                                TABLA 4: CONSOLIDADO DE PROCEDIMIENTOS PREVENTIVOS Y DE MORBILIDAD
                                            </span>
                                        </div>

                                        <h3>Procedimientos Preventivos:</h3>
                                        <table style={{ border: '1.5px solid #000' }}>
                                            <thead>
                                                <tr className="bg-gray" style={{ fontSize: '8px' }}>
                                                    <th rowSpan="2" style={{ textAlign: 'left', verticalAlign: 'middle', padding: '4px' }}>PROCEDIMIENTOS PREVENTIVOS</th>
                                                    <th colSpan="4">ESTUDIANTES</th>
                                                    <th colSpan="4">ADMINISTRATIVOS</th>
                                                    <th colSpan="4">DOCENTES</th>
                                                    <th rowSpan="2" style={{ verticalAlign: 'middle', backgroundColor: '#cbd5e1', padding: '4px' }}>TOTAL</th>
                                                </tr>
                                                <tr className="bg-gray" style={{ fontSize: '7.5px' }}>
                                                    <th>MASC.</th><th>FEM.</th><th>LGBTI</th><th className="font-bold">TOTAL</th>
                                                    <th>MASC.</th><th>FEM.</th><th>LGBTI</th><th className="font-bold">TOTAL</th>
                                                    <th>MASC.</th><th>FEM.</th><th>LGBTI</th><th className="font-bold">TOTAL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    let totalEstH = 0, totalEstM = 0, totalEstL = 0;
                                                    let totalAdmH = 0, totalAdmM = 0, totalAdmL = 0;
                                                    let totalDocH = 0, totalDocM = 0, totalDocL = 0;

                                                    let rows = Object.keys(genReportData.procPreventivos).map(k => {
                                                        const r = genReportData.procPreventivos[k];
                                                        totalEstH += r.estudiantes.hombres;
                                                        totalEstM += r.estudiantes.mujeres;
                                                        totalEstL += r.estudiantes.lgbti;
                                                        totalAdmH += r.administrativos.hombres;
                                                        totalAdmM += r.administrativos.mujeres;
                                                        totalAdmL += r.administrativos.lgbti;
                                                        totalDocH += r.docentes.hombres;
                                                        totalDocM += r.docentes.mujeres;
                                                        totalDocL += r.docentes.lgbti;

                                                        return (
                                                            <tr key={k}>
                                                                <td className="left-align font-bold" style={{ fontSize: '8px', padding: '4px' }}>{k}</td>
                                                                <td>{r.estudiantes.hombres || ''}</td>
                                                                <td>{r.estudiantes.mujeres || ''}</td>
                                                                <td>{r.estudiantes.lgbti || ''}</td>
                                                                <td className="font-bold bg-gray">{r.estudiantes.hombres + r.estudiantes.mujeres + r.estudiantes.lgbti}</td>
                                                                <td>{r.administrativos.hombres || ''}</td>
                                                                <td>{r.administrativos.mujeres || ''}</td>
                                                                <td>{r.administrativos.lgbti || ''}</td>
                                                                <td className="font-bold bg-gray">{r.administrativos.hombres + r.administrativos.mujeres + r.administrativos.lgbti}</td>
                                                                <td>{r.docentes.hombres || ''}</td>
                                                                <td>{r.docentes.mujeres || ''}</td>
                                                                <td>{r.docentes.lgbti || ''}</td>
                                                                <td className="font-bold bg-gray">{r.docentes.hombres + r.docentes.mujeres + r.docentes.lgbti}</td>
                                                                <td className="bg-total font-bold">{r.estudiantes.hombres + r.estudiantes.mujeres + r.estudiantes.lgbti + r.administrativos.hombres + r.administrativos.mujeres + r.administrativos.lgbti + r.docentes.hombres + r.docentes.mujeres + r.docentes.lgbti}</td>
                                                            </tr>
                                                        );
                                                    });

                                                    rows.push(
                                                        <tr key="t4-prev-total" className="bg-total font-bold" style={{ fontSize: '8.5px', backgroundColor: '#cbd5e1' }}>
                                                            <td className="left-align" style={{ padding: '4px' }}>TOTAL</td>
                                                            <td>{totalEstH}</td><td>{totalEstM}</td><td>{totalEstL}</td><td>{totalEstH + totalEstM + totalEstL}</td>
                                                            <td>{totalAdmH}</td><td>{totalAdmM}</td><td>{totalAdmL}</td><td>{totalAdmH + totalAdmM + totalAdmL}</td>
                                                            <td>{totalDocH}</td><td>{totalDocM}</td><td>{totalDocL}</td><td>{totalDocH + totalDocM + totalDocL}</td>
                                                            <td style={{ backgroundColor: '#94a3b8', color: '#fff' }}>{totalEstH + totalEstM + totalEstL + totalAdmH + totalAdmM + totalAdmL + totalDocH + totalDocM + totalDocL}</td>
                                                        </tr>
                                                    );
                                                    return rows;
                                                })()}
                                            </tbody>
                                        </table>

                                        <h3>Procedimientos de Morbilidad:</h3>
                                        <table style={{ border: '1.5px solid #000' }}>
                                            <thead>
                                                <tr className="bg-gray" style={{ fontSize: '8px' }}>
                                                    <th rowSpan="2" style={{ textAlign: 'left', verticalAlign: 'middle', padding: '4px' }}>PROCEDIMIENTOS MORBILIDAD</th>
                                                    <th colSpan="4">ESTUDIANTES</th>
                                                    <th colSpan="4">ADMINISTRATIVOS</th>
                                                    <th colSpan="4">DOCENTES</th>
                                                    <th rowSpan="2" style={{ verticalAlign: 'middle', backgroundColor: '#cbd5e1', padding: '4px' }}>TOTAL</th>
                                                </tr>
                                                <tr className="bg-gray" style={{ fontSize: '7.5px' }}>
                                                    <th>MASC.</th><th>FEM.</th><th>LGBTI</th><th className="font-bold">TOTAL</th>
                                                    <th>MASC.</th><th>FEM.</th><th>LGBTI</th><th className="font-bold">TOTAL</th>
                                                    <th>MASC.</th><th>FEM.</th><th>LGBTI</th><th className="font-bold">TOTAL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    let totalEstH = 0, totalEstM = 0, totalEstL = 0;
                                                    let totalAdmH = 0, totalAdmM = 0, totalAdmL = 0;
                                                    let totalDocH = 0, totalDocM = 0, totalDocL = 0;

                                                    let rows = Object.keys(genReportData.procMorbilidad).map(k => {
                                                        const r = genReportData.procMorbilidad[k];
                                                        totalEstH += r.estudiantes.hombres;
                                                        totalEstM += r.estudiantes.mujeres;
                                                        totalEstL += r.estudiantes.lgbti;
                                                        totalAdmH += r.administrativos.hombres;
                                                        totalAdmM += r.administrativos.mujeres;
                                                        totalAdmL += r.administrativos.lgbti;
                                                        totalDocH += r.docentes.hombres;
                                                        totalDocM += r.docentes.mujeres;
                                                        totalDocL += r.docentes.lgbti;

                                                        return (
                                                            <tr key={k}>
                                                                <td className="left-align font-bold" style={{ fontSize: '8px', padding: '4px' }}>{k}</td>
                                                                <td>{r.estudiantes.hombres || ''}</td>
                                                                <td>{r.estudiantes.mujeres || ''}</td>
                                                                <td>{r.estudiantes.lgbti || ''}</td>
                                                                <td className="font-bold bg-gray">{r.estudiantes.hombres + r.estudiantes.mujeres + r.estudiantes.lgbti}</td>
                                                                <td>{r.administrativos.hombres || ''}</td>
                                                                <td>{r.administrativos.mujeres || ''}</td>
                                                                <td>{r.administrativos.lgbti || ''}</td>
                                                                <td className="font-bold bg-gray">{r.administrativos.hombres + r.administrativos.mujeres + r.administrativos.lgbti}</td>
                                                                <td>{r.docentes.hombres || ''}</td>
                                                                <td>{r.docentes.mujeres || ''}</td>
                                                                <td>{r.docentes.lgbti || ''}</td>
                                                                <td className="font-bold bg-gray">{r.docentes.hombres + r.docentes.mujeres + r.docentes.lgbti}</td>
                                                                <td className="bg-total font-bold">{r.estudiantes.hombres + r.estudiantes.mujeres + r.estudiantes.lgbti + r.administrativos.hombres + r.administrativos.mujeres + r.administrativos.lgbti + r.docentes.hombres + r.docentes.mujeres + r.docentes.lgbti}</td>
                                                            </tr>
                                                        );
                                                    });

                                                    rows.push(
                                                        <tr key="t4-morb-total" className="bg-total font-bold" style={{ fontSize: '8.5px', backgroundColor: '#cbd5e1' }}>
                                                            <td className="left-align" style={{ padding: '4px' }}>TOTAL</td>
                                                            <td>{totalEstH}</td><td>{totalEstM}</td><td>{totalEstL}</td><td>{totalEstH + totalEstM + totalEstL}</td>
                                                            <td>{totalAdmH}</td><td>{totalAdmM}</td><td>{totalAdmL}</td><td>{totalAdmH + totalAdmM + totalAdmL}</td>
                                                            <td>{totalDocH}</td><td>{totalDocM}</td><td>{totalDocL}</td><td>{totalDocH + totalDocM + totalDocL}</td>
                                                            <td style={{ backgroundColor: '#94a3b8', color: '#fff' }}>{totalEstH + totalEstM + totalEstL + totalAdmH + totalAdmM + totalAdmL + totalDocH + totalDocM + totalDocL}</td>
                                                        </tr>
                                                    );
                                                    return rows;
                                                })()}
                                            </tbody>
                                        </table>

                                        <div className="footnote-address">
                                            Dirección: Av. Ernesto Che Guevara y Gabriel Secaira · Guaranda-Ecuador · Teléfono: (593) 3220 6010 EXT 1168 · www.ueb.edu.ec
                                        </div>
                                    </div>

                                    {/* PÁGINA FINAL */}
                                    <div className="preview-sheet">
                                        <h2>4. Conclusiones</h2>
                                        <p>
                                            El Servicio de Odontología del Departamento de Bienestar Universitario garantiza con éxito el derecho a la salud buco-dental de toda la población de la Universidad Estatal de Bolívar. Durante este período se logró cubrir atenciones preventivas fundamentales mediante el examen odontológico de rutina, reduciendo el riesgo de patologías severas.
                                        </p>
                                        <p>
                                            Asimismo, la morbilidad odontológica (tratamientos curativos de caries de esmalte, dentina, pulpitis, extracciones y destartrajes) fue atendida con profesionalismo y celeridad, logrando rehabilitar la salud oral y permitiendo un adecuado desempeño académico y laboral de los usuarios atendidos.
                                        </p>

                                        <h2>5. Recomendaciones</h2>
                                        <p>
                                            1. Mantener un stock permanente y oportuno de materiales e insumos odontológicos esenciales, asegurando la continuidad operativa del consultorio dental.
                                        </p>
                                        <p>
                                            2. Fomentar talleres informativos sobre técnicas de cepillado e higiene oral en las carreras que registraron menor tasa de atenciones preventivas durante este período académico.
                                        </p>

                                        <h2>6. Anexos</h2>
                                        <p style={{ fontSize: '10px', marginBottom: '15px' }}>
                                            Adjunto 18 fojas, copias a color partes diarios.
                                        </p>

                                        <table className="report-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '25px', border: '1px solid #000', fontSize: '9px' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#cbd5e1', fontWeight: 'bold' }}>
                                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', width: '30%', fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>Datos</td>
                                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', width: '35%', fontWeight: 'bold' }}>Elaborado por:</td>
                                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', width: '35%', fontWeight: 'bold' }}>Revisado y Aprobado por:</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ border: '1px solid #000', padding: '12px 6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#f1f5f9', height: '60px' }}>Firmas</td>
                                                    <td style={{ border: '1px solid #000', padding: '6px', height: '60px' }}></td>
                                                    <td style={{ border: '1px solid #000', padding: '6px', height: '60px' }}></td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>Nombre y Apellido</td>
                                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{doctorNameText}</td>
                                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>Michel Gaibor Vásquez</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>Cargo</td>
                                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', color: '#334155' }}>Odontóloga de Bienestar Universitario</td>
                                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', color: '#334155' }}>Coordinadora de Bienestar Universitario</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <div className="footnote-address" style={{ marginTop: '80px' }}>
                                            Dirección: Av. Ernesto Che Guevara y Gabriel Secaira · Guaranda-Ecuador · Teléfono: (593) 3220 6010 EXT 1168 · www.ueb.edu.ec
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                        <h4 className="field-header__title">Notas Médicas y Recomendaciones</h4>
                                    </div>
                                    <span className="field-badge-req">Requerido</span>
                                </div>
                                <textarea
                                    required
                                    value={notasDoctor}
                                    onChange={(e) => setNotasDoctor(e.target.value)}
                                    placeholder="Ingrese el diagnóstico final, recomendaciones, recetas o indicaciones brindadas en la consulta..."
                                    rows={4}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '12.5px', minHeight: '110px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                <button type="button" className="action-button action-button--light" onClick={() => setCompletingCita(null)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="action-button action-button--primary" disabled={savingNotas}>
                                    {savingNotas ? "Guardando..." : "Guardar y Finalizar Cita"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <HelpPanel
                helpItems={[
                    { title: 'Paso 1: Buscar o Seleccionar Paciente', content: 'Ingrese el número de cédula del paciente en la barra superior derecha y haga clic en Buscar. Seleccione al paciente de la lista de resultados.' },
                    { title: 'Paso 2: Registro del Odontograma Interactivo', content: 'En el odontograma visual, haga clic sobre los dientes correspondientes para marcar afecciones o tratamientos (Caries, Corona, Extracción, Obturado, etc.). Esto se registra y actualiza en tiempo real.' },
                    { title: 'Paso 3: Ficha Clínica y Diagnóstico', content: 'Llene las secciones de la ficha (Motivo de Consulta, Examen del Sistema Estomatognático, Diagnósticos y Tratamientos). Haga clic en el botón "Guardar" de cada sección.' },
                    { title: 'Paso 4: Ver Historial y Exportar PDF', content: 'Abra el Libro de Historiales del paciente, seleccione la sesión correspondiente en la lista izquierda y presione "[PDF]" para ver el reporte de esa sesión dental en una nueva pestaña listo para su impresión.' }
                ]}
                contactInfo={{ email: 'soporte@ueb.edu.ec' }}
            />
        </div>
    );
};

export default Odontologo_page;
