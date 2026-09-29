import React, { useState, useEffect } from 'react';
import {
    User, BookOpen, HeartPulse, Brain, Shield, Activity,
    ChevronRight, ChevronLeft, GraduationCap, MapPin, Phone,
    AlertCircle, FileText, CheckCircle2, ShieldAlert,
    Info, LogOut, Bell, Stethoscope, ClipboardList, Menu, X, Camera,
    FileSpreadsheet, Scale, Thermometer, Heart, Coins, Edit3, Eye,
    Calendar, Clock, Trash2, Pencil, Download, AlertTriangle, Printer,
    Sparkles, UserCheck, Home, Globe, Award, XCircle, Search, Plus, Filter,
    Droplet, CalendarCheck, Loader2
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';
import UserProfileMenu from '../../components/UserProfileMenu';
import NotificationMenu from '../../components/NotificationMenu';
import '../../medical.css';

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

// Fallback Mock Data for catalogs if backend returns empty lists
const mockFacultades = [
    { id: 1, nombre: 'Facultad de Ciencias Administrativas, Gestión Empresarial e Informática' },
    { id: 2, nombre: 'Facultad de Jurisprudencia, Ciencias Sociales y Políticas' },
    { id: 3, nombre: 'Facultad de Ciencias de la Educación, Sociales, Filosóficas y Humanísticas' },
    { id: 4, nombre: 'Facultad de Ciencias Agropecuarias, Recursos Naturales y del Ambiente' },
    { id: 5, nombre: 'Facultad de Ciencias de la Salud y del Ser Humano' },
    { id: 6, nombre: 'Extensión Universitaria de San Miguel' }
];

const mockCarreras = [
    { id: 1, id_facultad: 1, nombre: 'Administración de Empresas' },
    { id: 2, id_facultad: 1, nombre: 'Software' },
    { id: 3, id_facultad: 1, nombre: 'Tecnologías de la Información' },
    { id: 4, id_facultad: 2, nombre: 'Derecho' },
    { id: 5, id_facultad: 3, nombre: 'Educación Básica' },
    { id: 6, id_facultad: 5, nombre: 'Enfermería' },
    { id: 7, id_facultad: 5, nombre: 'Psicología' },
    { id: 8, id_facultad: 6, nombre: 'Criminalística' }
];

const mockCiclos = [
    { id: 1, numero: 'Primero' },
    { id: 2, numero: 'Segundo' },
    { id: 3, numero: 'Tercero' },
    { id: 4, numero: 'Cuarto' },
    { id: 5, numero: 'Quinto' },
    { id: 6, numero: 'Sexto' },
    { id: 7, numero: 'Séptimo' },
    { id: 8, numero: 'Octavo' }
];

const mockTiposUsuario = [
    { id: 2, nombre: 'Estudiante' },
    { id: 3, nombre: 'Docente' },
    { id: 4, nombre: 'Administrativo' },
    { id: 5, nombre: 'Código de Trabajo' }
];

const mockEtnias = [
    { id: 1, nombre: 'Mestizo' },
    { id: 2, nombre: 'Indígena' },
    { id: 3, nombre: 'Afroecuatoriano' },
    { id: 4, nombre: 'Montubio' },
    { id: 5, nombre: 'Blanco' },
    { id: 6, nombre: 'Otro' }
];

const mockGeneros = [
    { id: 1, nombre: 'Masculino' },
    { id: 2, nombre: 'Femenino' },
    { id: 3, nombre: 'LGBTI' }
];

const mockEstadosCivil = [
    { id: 1, nombres: 'Soltero' },
    { id: 2, nombres: 'Casado' },
    { id: 3, nombres: 'Viudo' },
    { id: 4, nombres: 'Divorciado' },
    { id: 5, nombres: 'Unión Libre' }
];

const mockProvincias = [
    { id: 1, nombre: 'Bolívar' },
    { id: 2, nombre: 'Pichincha' },
    { id: 3, nombre: 'Guayas' }
];

const mockCantones = [
    { id: 1, id_provincia: 1, nombre: 'Guaranda' },
    { id: 2, id_provincia: 1, nombre: 'Chimbo' },
    { id: 3, id_provincia: 1, nombre: 'San Miguel' },
    { id: 4, id_provincia: 2, nombre: 'Quito' },
    { id: 5, id_provincia: 3, nombre: 'Guayaquil' }
];

const mockTiposDireccion = [
    { id: 1, nombre: 'Procedencia' },
    { id: 2, nombre: 'Actual' }
];

const getAnatomicalRegion = (x, y) => {
    if (x === null || y === null || x === undefined || y === undefined) return '';
    const side = x < 50 ? "Frente" : "Espalda";
    const relativeX = x < 50 ? x * 2 : (x - 50) * 2;
    let region = "Cuerpo";
    if (y < 20) region = "Cabeza / Cráneo";
    else if (y >= 20 && y < 27) region = "Cuello";
    else if (y >= 27 && y < 50) {
        if (relativeX < 30) region = side === "Frente" ? "Brazo Derecho" : "Brazo Izquierdo";
        else if (relativeX > 70) region = side === "Frente" ? "Brazo Izquierdo" : "Brazo Derecho";
        else region = side === "Frente" ? "Tórax" : "Espalda Superior";
    } else if (y >= 50 && y < 70) {
        if (relativeX < 30) region = side === "Frente" ? "Mano Derecha" : "Mano Izquierda";
        else if (relativeX > 70) region = side === "Frente" ? "Mano Izquierda" : "Mano Derecha";
        else region = side === "Frente" ? "Abdomen" : "Espalda Inferior / Lumbar";
    } else {
        if (relativeX < 50) region = side === "Frente" ? "Pierna Derecha" : "Pierna Izquierda";
        else region = side === "Frente" ? "Pierna Izquierda" : "Pierna Derecha";
    }
    return `${region} (${side})`;
};

const PacienteDashboard = () => {
    const { user, logout } = useAuthStore();

    // Core Navigation & UI state
    const [activeTab, setActiveTab] = useState('portal'); // 'portal' | 'historial'
    const [activeSubTab, setActiveSubTab] = useState('libros'); // 'libros' | 'recetario' | 'libro'
    const [recetarioFilter, setRecetarioFilter] = useState('Todos');
    const [recetarioDate, setRecetarioDate] = useState('');
    const [recetarioPage, setRecetarioPage] = useState(1);
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [isViewFichaOpen, setIsViewFichaOpen] = useState(false);
    const [photoError, setPhotoError] = useState(false);

    // Appointments states (Citas Médicas)
    const [citasList, setCitasList] = useState([]);
    const [citasLoading, setCitasLoading] = useState(false);
    const [doctoresDisponibles, setDoctoresDisponibles] = useState([]);
    const [doctoresLoading, setDoctoresLoading] = useState(false);
    const [selectedRolDoctor, setSelectedRolDoctor] = useState('medico_general');
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    // Citas Filters & Pagination
    const [citaFilterMonth, setCitaFilterMonth] = useState('todos');
    const [citaFilterSpecialty, setCitaFilterSpecialty] = useState('todas');
    const [citaPage, setCitaPage] = useState(1);
    const CITAS_PER_PAGE = 5;

    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [motivoCita, setMotivoCita] = useState('');
    const [savingCita, setSavingCita] = useState(false);
    const [errorCita, setErrorCita] = useState('');
    const [successCita, setSuccessCita] = useState('');
    const [ocupacionalAccessDenied, setOcupacionalAccessDenied] = useState(false);

    // Catalogs
    const [catalogs, setCatalogs] = useState({
        facultades: [],
        carreras: [],
        ciclos: [],
        tipos_usuario: [],
        etnias: [],
        generos: [],
        estados_civil: [],
        provincias: [],
        cantones: [],
        tipos_direccion: [],
        tipos_sangre: []
    });

    // Medical History data
    const [areaHistories, setAreaHistories] = useState({
        medicina: [],
        psicologia: [],
        odontologia: [],
        enfermeria: []
    });

    // Medical File details (Ficha de Salud)
    const [vitalsList, setVitalsList] = useState([]);
    const [antecedentes, setAntecedentes] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [activeBookArea, setActiveBookArea] = useState('medicina');
    const [activeBookRecord, setActiveBookRecord] = useState(null);

    // Form states for Stepper
    const [currentStep, setCurrentStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Step 1 Form (Identification)
    const [personalForm, setPersonalForm] = useState({
        primer_nombre: '',
        segundo_nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        numero_cedula: '',
        fecha_nacimiento: ''
    });

    // Step 2 Form (Academic)
    const [academicForm, setAcademicForm] = useState({
        id_facultad: '',
        id_carrera: '',
        id_ciclo: '',
        id_tipo_usuario: ''
    });

    // Step 3 Form (Demographics)
    const [demographicForm, setDemographicForm] = useState({
        id_genero: '',
        id_estado_civil: '',
        id_identificacion_etnica: '',
        nacionalidad: 'Ecuador',
        id_tipo_sangre: '',

        // Lugar de Nacimiento
        id_provincia_nacimiento: '',
        id_canton_nacimiento: '',

        // Residencia Actual
        id_provincia: '',
        id_canton: '',
        direccion_referencia: '',
        telefono_convencional: '',
        es_extranjero: false
    });

    // Step 4 Form (Emergency Contact & Extras)
    const [emergencyForm, setEmergencyForm] = useState({
        nombre_completo: '',
        parentesco: '',
        telefono: '',
        celular: ''
    });

    // Socioeconomic Form State
    const [socioeconomicForm, setSocioeconomicForm] = useState({
        nivel_instruccion_jefe_hogar: '',
        empleo_jefe_hogar: '',
        ingresos_mensuales: '',
        tipo_vivienda: '',
        numero_personas_hogar: '',
        numero_aportantes: '',
        posee_internet: false,
        posee_computadora: false,
        recibe_beca: false
    });
    const [extraForm, setExtraForm] = useState({
        numero_hijos: 0,
        alergias: '',
        discapacidades: ''
    });

    // Parse and split initials names
    const prefillFromUserName = (nameStr) => {
        if (!nameStr) return;
        const parts = nameStr.trim().split(/\s+/);
        let pNombre = '', sNombre = '', aPaterno = '', aMaterno = '';
        if (parts.length === 1) {
            pNombre = parts[0];
        } else if (parts.length === 2) {
            pNombre = parts[0];
            aPaterno = parts[1];
        } else if (parts.length === 3) {
            pNombre = parts[0];
            aPaterno = parts[1];
            aMaterno = parts[2];
        } else if (parts.length >= 4) {
            pNombre = parts[0];
            sNombre = parts[1];
            aPaterno = parts[2];
            aMaterno = parts.slice(3).join(' ');
        }
        setPersonalForm(prev => ({
            ...prev,
            primer_nombre: pNombre,
            segundo_nombre: sNombre,
            apellido_paterno: aPaterno,
            apellido_materno: aMaterno
        }));
    };

    // Fetch student profile status
    const fetchProfile = async () => {
        setProfileLoading(true);
        try {
            const res = await api.get('/user-profile/profile');
            const data = res.data.data;
            setProfile(data);
            setPhotoError(false);

            // Prefill forms if data exists, otherwise parse from user.name
            if (data.identification) {
                setPersonalForm({
                    primer_nombre: data.identification.primer_nombre || '',
                    segundo_nombre: data.identification.segundo_nombre || '',
                    apellido_paterno: data.identification.apellido_paterno || '',
                    apellido_materno: data.identification.apellido_materno || '',
                    numero_cedula: data.identification.numero_cedula || '',
                    fecha_nacimiento: data.identification.fecha_nacimiento || ''
                });
            } else if (user?.name) {
                prefillFromUserName(user.name);
            }

            if (data.career_study) {
                setAcademicForm({
                    id_facultad: data.career_study.id_facultad || '',
                    id_carrera: data.career_study.id_carrera || '',
                    id_ciclo: data.career_study.id_ciclo || '',
                    id_tipo_usuario: data.career_study.id_tipo_usuario || ''
                });
            } else {
                setAcademicForm(prev => ({ ...prev, id_tipo_usuario: '2' })); // Pre-select Estudiante
            }

            if (data.demographic) {
                setDemographicForm(prev => ({
                    ...prev,
                    id_genero: data.demographic.id_genero || '',
                    id_estado_civil: data.demographic.id_estado_civil || '',
                    id_identificacion_etnica: data.demographic.id_identificacion_etnica || '',
                    nacionalidad: data.demographic.nacionalidad || 'Ecuatoriana'
                }));
            }
            if (data.blood_type) {
                const bId = data.blood_type.id_tipo_sangre
                    || data.blood_type.tipoSangre?.id
                    || data.blood_type.tipo_sangre?.id
                    || data.blood_type.id
                    || '';
                setDemographicForm(prev => ({
                    ...prev,
                    id_tipo_sangre: bId ? String(bId) : ''
                }));
            }
            if (data.addresses && data.addresses.length > 0) {
                const activeAddr = data.addresses.find(a => Number(a.id_tipo_direccion) === 2) || data.addresses[0];
                const birthAddr = data.addresses.find(a => Number(a.id_tipo_direccion) === 3);
                setDemographicForm(prev => ({
                    ...prev,
                    id_provincia: activeAddr.id_provincia || '',
                    id_canton: activeAddr.id_canton || '',
                    direccion_referencia: activeAddr.direccion_referencia || '',
                    telefono_convencional: activeAddr.telefono_convencional || '',
                    es_extranjero: activeAddr.es_extranjero || false,
                    id_provincia_nacimiento: birthAddr ? birthAddr.id_provincia || '' : '',
                    id_canton_nacimiento: birthAddr ? birthAddr.id_canton || '' : ''
                }));
            }
            if (data.emergency_contacts && data.emergency_contacts.length > 0) {
                const activeContact = data.emergency_contacts[0];
                setEmergencyForm({
                    nombre_completo: activeContact.nombre_completo || '',
                    parentesco: activeContact.parentesco || '',
                    telefono: activeContact.telefono || '',
                    celular: activeContact.celular || ''
                });
            }

            if (data.children && data.children.length > 0) {
                setExtraForm(prev => ({ ...prev, numero_hijos: data.children[0].numero || 0 }));
            }
            if (data.allergies && data.allergies.length > 0) {
                setExtraForm(prev => ({ ...prev, alergias: data.allergies.map(a => a.detalle_alergia).join(', ') }));
            }
            if (data.disabilities && data.disabilities.length > 0) {
                setExtraForm(prev => ({ ...prev, discapacidades: data.disabilities.map(d => d.detalle_discapacidad).join(', ') }));
            }

            if (data.socioeconomic) {
                setSocioeconomicForm({
                    nivel_instruccion_jefe_hogar: data.socioeconomic.nivel_instruccion_jefe_hogar || '',
                    empleo_jefe_hogar: data.socioeconomic.empleo_jefe_hogar || '',
                    ingresos_mensuales: data.socioeconomic.ingresos_mensuales || '',
                    tipo_vivienda: data.socioeconomic.tipo_vivienda || '',
                    numero_personas_hogar: data.socioeconomic.numero_personas_hogar || '',
                    numero_aportantes: data.socioeconomic.numero_aportantes || '',
                    posee_internet: !!data.socioeconomic.posee_internet,
                    posee_computadora: !!data.socioeconomic.posee_computadora,
                    recibe_beca: !!data.socioeconomic.recibe_beca
                });
            }

        } catch (err) {
            console.error("Error al obtener perfil:", err);
        } finally {
            setProfileLoading(false);
        }
    };

    // Fetch catalogs
    const fetchCatalogs = async () => {
        try {
            const res = await api.get('/user-profile/catalogos');
            const data = res.data;

            setCatalogs({
                facultades: data.facultades?.length ? data.facultades : mockFacultades,
                carreras: data.carreras?.length ? data.carreras : mockCarreras,
                ciclos: data.ciclos?.length ? data.ciclos : mockCiclos,
                tipos_usuario: data.tipos_usuario?.length ? data.tipos_usuario : mockTiposUsuario,
                etnias: data.etnias?.length ? data.etnias : mockEtnias,
                generos: data.generos?.length ? data.generos : mockGeneros,
                estados_civil: data.estados_civil?.length ? data.estados_civil : mockEstadosCivil,
                provincias: data.provincias?.length ? data.provincias : mockProvincias,
                cantones: data.cantones?.length ? data.cantones : mockCantones,
                tipos_direccion: data.tipos_direccion?.length ? data.tipos_direccion : mockTiposDireccion,
                tipos_sangre: data.tipos_sangre?.length ? data.tipos_sangre : []
            });
        } catch (err) {
            console.error("Error al obtener catálogos, usando fallbacks:", err);
            setCatalogs({
                facultades: mockFacultades,
                carreras: mockCarreras,
                ciclos: mockCiclos,
                tipos_usuario: mockTiposUsuario,
                etnias: mockEtnias,
                generos: mockGeneros,
                estados_civil: mockEstadosCivil,
                provincias: mockProvincias,
                cantones: mockCantones,
                tipos_direccion: mockTiposDireccion,
                tipos_sangre: []
            });
        }
    };

    // Load histories when profile is complete
    const fetchHistories = async () => {
        if (!user?.id) return;
        setHistoryLoading(true);
        try {
            const patientId = user.id;
            const [
                medEvolRes, medDiarioRes, medSignosRes, medExamenRes,
                psiEvolRes, psiDiarioRes,
                odoEvolRes, odoDiarioRes,
                enfVitalsRes, enfDiarioRes,
                antecedentesRes
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
                api.get('/enfermeria/parte-diario', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/medicina-general/antecedentes', { params: { id_usuario_paciente: patientId } }).catch(() => ({ data: { data: [] } }))
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
            const medExamen = filterByPatient(medExamenRes.data.data);

            const psiEvol = filterByPatient(psiEvolRes.data.data);
            const psiDiario = filterByPatient(psiDiarioRes.data.data);

            const odoEvol = filterByPatient(odoEvolRes.data.data);
            const odoDiario = filterByPatient(odoDiarioRes.data.data);

            const enfVitals = filterByPatient(enfVitalsRes.data.data);
            const enfDiario = filterByPatient(enfDiarioRes.data.data);
            const rawAntecedentes = filterByPatient(antecedentesRes.data.data);

            const mergedVitals = [
                ...medSignos.map(v => ({ ...v, source: 'Medicina General' })),
                ...enfVitals.map(v => ({ ...v, source: 'Enfermería' }))
            ].sort((a, b) => new Date(b.fecha || b.created_at) - new Date(a.fecha || a.created_at));

            setVitalsList(mergedVitals);
            setAntecedentes(rawAntecedentes);

            setAreaHistories({
                medicina: [
                    ...medEvol.map(x => ({ ...x, type: 'evolucion', recordTitle: 'Evolución Clínica' })),
                    ...medDiario.map(x => ({ ...x, type: 'diario', recordTitle: 'Consulta de Jornada' })),
                    ...medSignos.map(x => ({ ...x, type: 'signos', recordTitle: 'Signos Vitales' })),
                    ...medExamen.map(x => ({ ...x, type: 'examen_fisico', recordTitle: 'Examen Físico' }))
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
            console.error("Error al cargar antecedentes de paciente:", err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('foto', file);

        setUploadingPhoto(true);
        setPhotoError(false);
        try {
            await api.post('/user-profile/photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            await fetchProfile();
        } catch (err) {
            console.error("Error al subir foto:", err);
            setAlertModal({
                show: true,
                title: 'Error al Subir Imagen',
                message: 'No se pudo subir la foto. Asegúrate de que sea una imagen válida (JPG/PNG) de hasta 5MB.',
                type: 'danger'
            });
        } finally {
            setUploadingPhoto(false);
        }
    };

    useEffect(() => {
        fetchProfile();
        fetchCatalogs();
    }, [user]);

    useEffect(() => {
        if (profile?.identification && profile?.career_study) {
            fetchHistories();
        }
    }, [profile]);

    useEffect(() => {
        setRecetarioPage(1);
    }, [recetarioFilter, recetarioDate]);

    // Appointments effects & helpers
    const fetchMisCitas = async () => {
        setCitasLoading(true);
        try {
            const res = await api.get('/citas-medicas/mis-citas');
            setCitasList(res.data.data);
        } catch (err) {
            console.error("Error fetching citas:", err);
        } finally {
            setCitasLoading(false);
        }
    };

    const fetchDoctoresDisponibles = async () => {
        setDoctoresLoading(true);
        try {
            const res = await api.get('/citas-medicas/doctores-disponibles');
            setDoctoresDisponibles(res.data.data);
        } catch (err) {
            console.error("Error fetching doctors:", err);
        } finally {
            setDoctoresLoading(false);
        }
    };

    const fetchDisponibilidad = async (doctorId, fecha) => {
        if (!doctorId || !fecha) return;
        setSlotsLoading(true);
        setAvailableSlots([]);
        setSelectedSlot('');
        try {
            const res = await api.get('/citas-medicas/disponibilidad', {
                params: {
                    id_usuario_doctor: doctorId,
                    fecha: fecha
                }
            });
            setAvailableSlots(res.data.data.slots_disponibles);
        } catch (err) {
            console.error("Error fetching disponibilidad:", err);
        } finally {
            setSlotsLoading(false);
        }
    };

    const checkOcupacionalAccess = async () => {
        try {
            const res = await api.get('/citas-medicas/verificar-acceso', {
                params: {
                    rol_doctor: 'medico_ocupacional'
                }
            });
            return res.data.data.acceder;
        } catch (err) {
            return false;
        }
    };

    const getTodayLocalDateStr = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getCurrentLocalTimeStr = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleAgendarCita = async (e) => {
        e.preventDefault();
        if (!selectedDoctorId || !selectedRolDoctor || !selectedDate || !selectedSlot) {
            setErrorCita("Por favor, complete todos los campos obligatorios.");
            return;
        }

        const todayStr = getTodayLocalDateStr();
        const currentHHMM = getCurrentLocalTimeStr();
        if (selectedDate === todayStr && selectedSlot <= currentHHMM) {
            setErrorCita("El horario seleccionado ya ha transcurrido. Por favor seleccione otro horario.");
            return;
        }

        setSavingCita(true);
        setErrorCita('');
        setSuccessCita('');
        try {
            await api.post('/citas-medicas', {
                id_usuario_doctor: selectedDoctorId,
                rol_doctor: selectedRolDoctor,
                fecha: selectedDate,
                hora_inicio: selectedSlot,
                motivo: motivoCita
            });
            setSuccessCita("¡Cita agendada exitosamente!");
            setSelectedDoctorId('');
            setSelectedDate('');
            setSelectedSlot('');
            setMotivoCita('');
            fetchMisCitas();
        } catch (err) {
            setErrorCita(err.response?.data?.message || "Error al agendar la cita.");
        } finally {
            setSavingCita(false);
        }
    };

    const handleCancelarCita = (citaId) => {
        setConfirmModal({
            show: true,
            title: 'Cancelar Cita Médica',
            message: '¿Estás seguro de que deseas cancelar esta cita médica? Esta acción liberará el cupo de atención.',
            type: 'danger',
            confirmText: 'Sí, Cancelar Cita',
            cancelText: 'No, Conservar Cita',
            onConfirm: async () => {
                try {
                    await api.patch(`/citas-medicas/${citaId}/cancelar`);
                    setSuccessCita('La cita ha sido cancelada correctamente.');
                    fetchMisCitas();
                } catch (err) {
                    setAlertModal({
                        show: true,
                        title: 'Error al Cancelar Cita',
                        message: err.response?.data?.message || 'Ocurrió un error al intentar cancelar la cita.',
                        type: 'danger'
                    });
                }
            }
        });
    };

    const handleConfirmarAsistencia = (citaId) => {
        setConfirmModal({
            show: true,
            title: 'Confirmar Asistencia',
            message: '¿Estás seguro de que deseas confirmar tu asistencia a esta cita médica? Esto confirmará al especialista que asistirás a la hora programada.',
            type: 'success',
            confirmText: 'Sí, Confirmar Asistencia',
            cancelText: 'No, Volver',
            onConfirm: async () => {
                try {
                    await api.patch(`/citas-medicas/${citaId}/confirmar-asistencia`);
                    setSuccessCita('Asistencia confirmada exitosamente.');
                    fetchMisCitas();
                } catch (err) {
                    setAlertModal({
                        show: true,
                        title: 'Error al Confirmar Asistencia',
                        message: err.response?.data?.message || 'Ocurrió un error al intentar confirmar la asistencia.',
                        type: 'danger'
                    });
                }
            }
        });
    };

    useEffect(() => {
        if (activeTab === 'citas' && isProfileComplete()) {
            fetchMisCitas();
            fetchDoctoresDisponibles();
        }
    }, [activeTab]);

    useEffect(() => {
        if (selectedDoctorId && selectedDate) {
            fetchDisponibilidad(selectedDoctorId, selectedDate);
        } else {
            setAvailableSlots([]);
            setSelectedSlot('');
        }
    }, [selectedDoctorId, selectedDate]);

    useEffect(() => {
        setSelectedDoctorId('');
        setSelectedDate('');
        setSelectedSlot('');
        setAvailableSlots([]);
        setErrorCita('');
        setSuccessCita('');
        setOcupacionalAccessDenied(false);

        if (selectedRolDoctor === 'medico_ocupacional' && isProfileComplete()) {
            checkOcupacionalAccess().then(hasAccess => {
                if (!hasAccess) {
                    setOcupacionalAccessDenied(true);
                }
            });
        }
    }, [selectedRolDoctor]);

    const isProfileComplete = () => {
        const hasIdent = !!profile?.identification?.numero_cedula;
        if (!hasIdent) return false;

        const idTipo = Number(profile?.career_study?.id_tipo_usuario);
        if (!idTipo) return false;

        if (idTipo === 2) { // Estudiante
            return !!(profile?.career_study?.id_facultad && profile?.career_study?.id_carrera && profile?.career_study?.id_ciclo);
        } else if (idTipo === 3 || idTipo === 4) { // Docente o Administrativo
            return !!profile?.career_study?.id_facultad;
        }

        return true; // Conserje (idTipo === 5)
    };

    const validateStep = (step) => {
        const errors = {};
        if (step === 1) {
            if (!personalForm.primer_nombre.trim()) errors.primer_nombre = 'Primer nombre es obligatorio';
            if (!personalForm.apellido_paterno.trim()) errors.apellido_paterno = 'Apellido paterno es obligatorio';
            if (!personalForm.numero_cedula.trim()) {
                errors.numero_cedula = demographicForm.es_extranjero ? 'Número de pasaporte es obligatorio' : 'Cédula es obligatoria';
            } else if (!demographicForm.es_extranjero && !/^\d{10}$/.test(personalForm.numero_cedula)) {
                errors.numero_cedula = 'La cédula ecuatoriana debe tener exactamente 10 dígitos numéricos';
            } else if (demographicForm.es_extranjero && !/^[A-Za-z0-9-]{5,20}$/.test(personalForm.numero_cedula)) {
                errors.numero_cedula = 'El pasaporte debe ser un código alfanumérico válido de entre 5 y 20 caracteres';
            }
            if (!personalForm.fecha_nacimiento) errors.fecha_nacimiento = 'Fecha de nacimiento es obligatoria';
        }
        if (step === 2) {
            if (!academicForm.id_tipo_usuario) {
                errors.id_tipo_usuario = 'Tipo de usuario es obligatorio';
            } else {
                const uType = Number(academicForm.id_tipo_usuario);
                if (uType === 2) { // Estudiante
                    if (!academicForm.id_facultad) errors.id_facultad = 'Facultad es obligatoria';
                    if (!academicForm.id_carrera) errors.id_carrera = 'Carrera es obligatoria';
                    if (!academicForm.id_ciclo) errors.id_ciclo = 'Ciclo/Semestre es obligatorio';
                } else if (uType === 3 || uType === 4) { // Docente o Administrativo
                    if (!academicForm.id_facultad) errors.id_facultad = 'Facultad es obligatoria';
                }
            }
        }
        if (step === 3) {
            if (!demographicForm.id_genero) errors.id_genero = 'Género es obligatorio';
            if (!demographicForm.id_estado_civil) errors.id_estado_civil = 'Estado civil es obligatorio';
            if (!demographicForm.id_identificacion_etnica) errors.id_identificacion_etnica = 'Etnia es obligatoria';

            if (!demographicForm.es_extranjero) {
                if (!demographicForm.id_provincia) errors.id_provincia = 'Provincia es obligatoria';
                if (!demographicForm.id_canton) errors.id_canton = 'Cantón es obligatorio';
            }
            if (!demographicForm.direccion_referencia.trim()) errors.direccion_referencia = 'Dirección de residencia es obligatoria';
        }
        if (step === 4) {
            if (!emergencyForm.nombre_completo.trim()) errors.emergency_nombre = 'Nombre de contacto es obligatorio';
            if (!emergencyForm.parentesco.trim()) errors.emergency_parentesco = 'Parentesco es obligatorio';
            if (!emergencyForm.telefono.trim()) errors.emergency_telefono = 'Teléfono de contacto es obligatorio';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSaveProfile = async () => {
        if (!validateStep(4)) return;
        setSaving(true);
        try {
            // Clear existing address, contact, and extra options to prevent duplicates
            if (profile?.addresses && profile.addresses.length > 0) {
                for (const addr of profile.addresses) {
                    try { await api.delete(`/user-profile/addresses/${addr.id}`); } catch (e) { }
                }
            }
            if (profile?.emergency_contacts && profile.emergency_contacts.length > 0) {
                for (const contact of profile.emergency_contacts) {
                    try { await api.delete(`/user-profile/emergency-contacts/${contact.id}`); } catch (e) { }
                }
            }
            if (profile?.children && profile.children.length > 0) {
                for (const child of profile.children) {
                    try { await api.delete(`/user-profile/children/${child.id}`); } catch (e) { }
                }
            }
            if (profile?.allergies && profile.allergies.length > 0) {
                for (const allergy of profile.allergies) {
                    try { await api.delete(`/user-profile/allergies/${allergy.id}`); } catch (e) { }
                }
            }
            if (profile?.disabilities && profile.disabilities.length > 0) {
                for (const disability of profile.disabilities) {
                    try { await api.delete(`/user-profile/disabilities/${disability.id}`); } catch (e) { }
                }
            }

            // 1. Save Identification
            await api.post('/user-profile/identification', personalForm);

            // 2. Save Academic Data
            await api.post('/user-profile/career-study', academicForm);

            // 3. Save Demographic Data
            await api.post('/user-profile/demographic', {
                id_genero: demographicForm.id_genero,
                id_estado_civil: demographicForm.id_estado_civil,
                id_identificacion_etnica: demographicForm.id_identificacion_etnica,
                nacionalidad: demographicForm.es_extranjero ? demographicForm.nacionalidad : 'Ecuatoriana'
            });

            // 3b. Save Blood Type (Opcional)
            const bloodTypeId = Number(demographicForm.id_tipo_sangre);
            if (bloodTypeId && bloodTypeId >= 1 && bloodTypeId <= 8) {
                try {
                    await api.post('/user-profile/blood-type', {
                        id_tipo_sangre: bloodTypeId
                    });
                } catch (bErr) {
                    console.warn("No se pudo actualizar el tipo de sangre opcional:", bErr);
                }
            }

            // 4. Save Address (Residencia Actual)
            await api.post('/user-profile/addresses', {
                id_provincia: demographicForm.es_extranjero ? null : demographicForm.id_provincia,
                id_canton: demographicForm.es_extranjero ? null : demographicForm.id_canton,
                direccion_referencia: demographicForm.direccion_referencia,
                telefono_convencional: demographicForm.telefono_convencional,
                es_extranjero: demographicForm.es_extranjero,
                id_tipo_direccion: 2
            });

            // 4b. Save Address (Lugar de Nacimiento)
            if (!demographicForm.es_extranjero && demographicForm.id_provincia_nacimiento && demographicForm.id_canton_nacimiento) {
                await api.post('/user-profile/addresses', {
                    id_provincia: demographicForm.id_provincia_nacimiento,
                    id_canton: demographicForm.id_canton_nacimiento,
                    direccion_referencia: 'Lugar de Nacimiento',
                    es_extranjero: false,
                    id_tipo_direccion: 3
                });
            }

            // 5. Save Emergency Contact
            await api.post('/user-profile/emergency-contacts', emergencyForm);

            // 6. Save Extra Options
            if (extraForm.numero_hijos > 0) {
                await api.post('/user-profile/children', { numero: extraForm.numero_hijos });
            }
            if (extraForm.alergias.trim()) {
                const list = extraForm.alergias.split(',').map(s => s.trim()).filter(Boolean);
                for (const item of list) {
                    await api.post('/user-profile/allergies', { detalle_alergia: item });
                }
            }
            if (extraForm.discapacidades.trim()) {
                const list = extraForm.discapacidades.split(',').map(s => s.trim()).filter(Boolean);
                for (const item of list) {
                    await api.post('/user-profile/disabilities', { detalle_discapacidad: item });
                }
            }

            // Sync user name in frontend
            const userRes = await api.get('/users/' + user.id);
            useAuthStore.setState({ user: userRes.data.data });

            await fetchProfile();
            setIsRegistering(false);
            setCurrentStep(1);
        } catch (err) {
            console.error("Error al guardar perfil:", err);
            let message = "Ocurrió un error al guardar tu perfil. Por favor, verifica los campos.";

            if (err.response) {
                const status = err.response.status;
                const url = err.response.config?.url || '';
                const responseData = err.response.data;

                message += `\n\n[API Error ${status} en ${url}]`;

                if (responseData?.errors) {
                    const details = Object.keys(responseData.errors)
                        .map(key => `• ${key}: ${responseData.errors[key].join(', ')}`)
                        .join('\n');
                    message += `\n\nDetalles del error:\n${details}`;
                } else if (responseData?.message) {
                    message += `\n\nMensaje del servidor: ${responseData.message}`;
                }
            } else {
                message += `\n\nDetalle técnico: ${err.message}`;
            }

            setAlertModal({
                show: true,
                title: 'Error al Guardar Perfil',
                message: message,
                type: 'danger'
            });
        } finally {
            setSaving(false);
        }
    };

    const [savingSocioeconomic, setSavingSocioeconomic] = useState(false);
    const [socioeconomicMessage, setSocioeconomicMessage] = useState(null);

    const handleSaveSocioeconomic = async (e) => {
        if (e) e.preventDefault();
        setSavingSocioeconomic(true);
        setSocioeconomicMessage(null);
        try {
            await api.post('/user-profile/socioeconomic', {
                nivel_instruccion_jefe_hogar: socioeconomicForm.nivel_instruccion_jefe_hogar || null,
                empleo_jefe_hogar: socioeconomicForm.empleo_jefe_hogar || null,
                ingresos_mensuales: socioeconomicForm.ingresos_mensuales || null,
                tipo_vivienda: socioeconomicForm.tipo_vivienda || null,
                numero_personas_hogar: socioeconomicForm.numero_personas_hogar ? Number(socioeconomicForm.numero_personas_hogar) : null,
                numero_aportantes: socioeconomicForm.numero_aportantes ? Number(socioeconomicForm.numero_aportantes) : null,
                posee_internet: !!socioeconomicForm.posee_internet,
                posee_computadora: !!socioeconomicForm.posee_computadora,
                recibe_beca: !!socioeconomicForm.recibe_beca
            });
            setSocioeconomicMessage({ type: 'success', text: '¡Ficha Socioeconómica guardada exitosamente!' });
            await fetchProfile();
        } catch (err) {
            console.error("Error al guardar ficha socioeconómica:", err);
            setSocioeconomicMessage({ type: 'error', text: 'Error al guardar la ficha. Por favor, intente de nuevo.' });
        } finally {
            setSavingSocioeconomic(false);
        }
    };

    const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', type: 'warning' });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', type: 'danger', confirmText: '', cancelText: '', onConfirm: null });
    const [noCertificateModal, setNoCertificateModal] = useState({ show: false, message: '' });
    const [viewDetailsModal, setViewDetailsModal] = useState({ show: false, record: null, area: '' });

    const handlePrintFicha = () => {
        if (!profile) return;
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                setAlertModal({
                    show: true,
                    title: 'Bloqueador de Ventanas Activo',
                    message: 'El navegador impidió abrir la ventana de impresión. Habilite los permisos correspondientes.',
                    type: 'warning'
                });
                return;
            }

            const getFullAddressHtml = () => {
                if (!profile.directions || profile.directions.length === 0) return '<p>No registrado</p>';
                return profile.directions.map((dir, idx) => `
                    <div style="margin-bottom: 12px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <strong style="color: #b71a34; font-size: 11px; text-transform: uppercase;">Dirección de ${dir.id_tipo_direccion === 1 ? 'Procedencia' : dir.id_tipo_direccion === 2 ? 'Residencia Actual' : 'Lugar de Nacimiento'}</strong>
                        <table style="width:100%; border-collapse: collapse; margin-top: 6px; font-size: 12px;">
                            <tr>
                                <td style="width: 25%; font-weight: bold; padding: 3px 0;">Provincia:</td>
                                <td>${dir.provincia?.nombre || '—'}</td>
                                <td style="width: 25%; font-weight: bold; padding: 3px 0;">Cantón:</td>
                                <td>${dir.canton?.nombre || '—'}</td>
                            </tr>
                            ${dir.id_tipo_direccion !== 3 ? `
                            <tr>
                                <td style="font-weight: bold; padding: 3px 0;">Calle Principal:</td>
                                <td>${dir.calle_principal || '—'}</td>
                                <td style="font-weight: bold; padding: 3px 0;">Calle Sec.:</td>
                                <td>${dir.calle_secundaria || '—'}</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold; padding: 3px 0;">Referencia:</td>
                                <td colspan="3">${dir.referencia || '—'}</td>
                            </tr>
                            ` : ''}
                        </table>
                    </div>
                `).join('');
            };

            const getEmergencyHtml = () => {
                if (!profile.emergency_contacts || profile.emergency_contacts.length === 0) return '<p>No registrado</p>';
                const contact = profile.emergency_contacts[0];
                return `
                    <table style="width:100%; border-collapse: collapse; font-size: 12px;">
                        <tr>
                            <td style="width: 25%; font-weight: bold; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">Nombre:</td>
                            <td style="border-bottom: 1px solid #f1f5f9;">${contact.nombre_completo || '—'}</td>
                            <td style="width: 25%; font-weight: bold; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">Parentesco:</td>
                            <td style="border-bottom: 1px solid #f1f5f9;">${contact.parentesco || '—'}</td>
                        </tr>
                        <tr>
                            <td style="font-weight: bold; padding: 6px 0;">Teléfono Fijo:</td>
                            <td>${contact.telefono || '—'}</td>
                            <td style="font-weight: bold; padding: 6px 0;">Celular:</td>
                            <td>${contact.celular || '—'}</td>
                        </tr>
                    </table>
                `;
            };

            const photoHtml = getPhotoUrl()
                ? `<img src="${getPhotoUrl()}" style="width: 100px; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.05);" />`
                : `<div style="width: 100px; height: 120px; border: 1px dashed #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 10px; text-align: center;">Sin Foto</div>`;

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Ficha Médica & Socioeconómica - UEB</title>
                    <style>
                        body {
                            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                            color: #1e293b;
                            margin: 40px auto;
                            max-width: 800px;
                            line-height: 1.5;
                        }
                        .header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            border-bottom: 3px solid #b71a34;
                            padding-bottom: 16px;
                            margin-bottom: 30px;
                        }
                        .header-text h1 {
                            font-size: 20px;
                            color: #0b3155;
                            margin: 0;
                            font-weight: 800;
                            text-transform: uppercase;
                        }
                        .header-text p {
                            font-size: 12px;
                            color: #64748b;
                            margin: 4px 0 0 0;
                            font-weight: 500;
                        }
                        .section-title {
                            font-size: 13px;
                            color: #0b3155;
                            border-bottom: 2px solid #f1f5f9;
                            padding-bottom: 6px;
                            margin: 24px 0 12px 0;
                            text-transform: uppercase;
                            font-weight: bold;
                            letter-spacing: 0.5px;
                        }
                        .info-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 12px;
                            font-size: 12px;
                        }
                        .info-item {
                            padding: 4px 0;
                        }
                        .info-label {
                            font-weight: bold;
                            color: #64748b;
                            display: inline-block;
                            width: 140px;
                        }
                        .info-val {
                            color: #1e293b;
                            font-weight: 600;
                        }
                        @media print {
                            body { margin: 20px; max-width: 100%; }
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="header-text">
                            <h1>Universidad Estatal de Bolívar</h1>
                            <p>Dirección de Bienestar Universitario - Ficha Médica y Socioeconómica</p>
                        </div>
                        <div>
                            ${photoHtml}
                        </div>
                    </div>

                    <div style="font-size: 13px; margin-bottom: 20px; background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #0b3155;">
                        <strong>Usuario:</strong> ${profile?.identification?.primer_nombre} ${profile?.identification?.segundo_nombre || ''} ${profile?.identification?.apellido_paterno} ${profile?.identification?.apellido_materno || ''} 
                        &nbsp;&nbsp;&nbsp;&nbsp;<strong>Cédula:</strong> ${profile?.identification?.numero_cedula || '—'}
                    </div>

                    <div class="section-title">Datos Personales y Demográficos</div>
                    <div class="info-grid">
                        <div class="info-item"><span class="info-label">Fecha de Nacimiento:</span><span class="info-val">${profile?.identification?.fecha_nacimiento || '—'}</span></div>
                        <div class="info-item"><span class="info-label">Identificación de Género:</span><span class="info-val" style="text-transform: capitalize;">${profile?.demographic?.genero?.nombre || '—'}</span></div>
                        <div class="info-item"><span class="info-label">Estado Civil:</span><span class="info-val" style="text-transform: capitalize;">${profile?.demographic?.estado_civil?.nombres || profile?.demographic?.estadoCivil?.nombres || '—'}</span></div>
                        <div class="info-item"><span class="info-label">Nacionalidad:</span><span class="info-val">${profile?.identification?.es_extranjero ? `Extranjera (${profile?.identification?.nacionalidad || '—'})` : 'Ecuatoriana'}</span></div>
                    </div>

                    <div class="section-title">Información Institucional</div>
                    <div class="info-grid">
                        <div class="info-item"><span class="info-label">Tipo de Usuario:</span><span class="info-val">${profile?.career_study?.tipo_usuario?.nombre || 'Estudiante'}</span></div>
                        <div class="info-item"><span class="info-label">Facultad:</span><span class="info-val">${profile?.career_study?.facultad?.nombre || '—'}</span></div>
                        <div class="info-item"><span class="info-label">Carrera:</span><span class="info-val">${profile?.career_study?.carrera?.nombre || '—'}</span></div>
                        <div class="info-item"><span class="info-label">Ciclo / Semestre:</span><span class="info-val">${profile?.career_study?.ciclo?.numero || '—'} (Paralelo: ${profile?.career_study?.paralelo || '—'})</span></div>
                    </div>

                    <div class="section-title">Datos de Contacto y Ubicación</div>
                    <div class="info-grid" style="margin-bottom: 12px;">
                        <div class="info-item"><span class="info-label">Teléfono Fijo:</span><span class="info-val">${profile?.addresses?.[0]?.telefono_convencional || '—'}</span></div>
                        <div class="info-item"><span class="info-label">Correo:</span><span class="info-val">${user?.email || '—'}</span></div>
                    </div>
                    ${getFullAddressHtml()}

                    <div class="section-title">Contacto de Emergencia</div>
                    ${getEmergencyHtml()}

                    <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                        Documento generado automáticamente desde el Portal de Salud UEB.
                    </div>

                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 500);
                        };
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        } catch (err) {
            console.error("Error al imprimir ficha:", err);
        }
    };

    const handlePrintPatientCertificate = (area, record) => {
        if (record.tipo_atencion !== 'certificadomedico') {
            setNoCertificateModal({
                show: true,
                message: 'No hay certificado disponible para esta consulta. Póngase en contacto con el profesional de salud encargado si requiere la emisión de uno.'
            });
            return;
        }

        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                setAlertModal({
                    show: true,
                    title: 'Bloqueador de Ventanas Activo',
                    message: 'El navegador impidió abrir la ventana. Por favor, habilite los permisos de ventanas emergentes (popups) para este sitio.',
                    type: 'warning'
                });
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

            let areaName = 'Medicina General';
            let diagnosis = record.detalle_diagnostico || 'Evaluación Médica';
            let roleName = 'Médico/a Responsable';
            let departmentName = 'Área Médica';

            if (area === 'psicologia') {
                areaName = 'Psicología Clínica';
                diagnosis = record.detalle_diagnostico || 'Evaluación Psicológica';
                roleName = 'Responsable del Área de Psicología';
                departmentName = 'Área de Psicología';
            } else if (area === 'odontologia') {
                areaName = 'Odontología';
                diagnosis = record.diagnostico || 'Evaluación Odontológica';
                roleName = 'Responsable del Área de Odontología';
                departmentName = 'Área de Odontología';
            } else if (area === 'enfermeria') {
                areaName = 'Enfermería';
                diagnosis = record.procedimiento?.nombre_procedimiento || 'Control de Signos Vitales';
                roleName = 'Responsable de Enfermería';
                departmentName = 'Área de Enfermería';
            }

            const patientName = `${profile?.identification?.primer_nombre || ''} ${profile?.identification?.segundo_nombre || ''} ${profile?.identification?.apellido_paterno || ''} ${profile?.identification?.apellido_materno || ''}`.trim();
            const patientCedula = profile?.identification?.numero_cedula || '—';

            const htmlContent = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Certificado de Cita Médica</title>
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

                        <div class="certificate-title">CERTIFICADO CLÍNICO</div>

                        <div class="certificate-body">
                            Por medio de la presente, se hace constar y se certifica que el/la estudiante/usuario 
                            <span class="bold-text">${patientName}</span>, con cédula de identidad número 
                            <span class="bold-text">${patientCedula}</span>, asistió 
                            a la consulta del área de <span class="bold-text">${areaName}</span> el día 
                            <span class="bold-text">${(record.fecha || record.created_at || '').slice(0, 10)}</span>.
                            <br><br>
                            El paciente recibió atención y soporte clínico correspondiente, registrando en su expediente el diagnóstico o procedimiento 
                            de <span class="bold-text">"${diagnosis}"</span>, mostrando evolución favorable y estable.
                            <br><br>
                            Se expide el presente documento a petición de la parte interesada para los fines académicos o personales que correspondan.
                        </div>

                        <div class="footer-date">
                            Dado y firmado en la ciudad de Guaranda, a los ${dayNum} días del mes de ${monthName} del año ${year}.
                        </div>

                        <div class="signatures-container">
                            <div class="signature-box">
                                <div class="signature-line"></div>
                                <strong style="font-size: 13px; color: #0f172a;">Profesional de Salud</strong><br>
                                <span class="credentials">${roleName}</span><br>
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
            setAlertModal({
                show: true,
                title: 'Error de Impresión',
                message: 'Ocurrió un error al preparar el certificado médico para impresión.',
                type: 'danger'
            });
        }
    };

    // Filter carreras based on selected facultad
    const filteredCarreras = catalogs.carreras.filter(
        c => String(c.id_facultad) === String(academicForm.id_facultad)
    );

    // Filter cantones based on selected provincia
    const filteredCantones = catalogs.cantones.filter(
        c => String(c.id_provincia) === String(demographicForm.id_provincia)
    );

    const filteredCantonesNacimiento = catalogs.cantones.filter(
        c => String(c.id_provincia) === String(demographicForm.id_provincia_nacimiento)
    );

    // Resolve base path for photo url
    const getPhotoUrl = () => {
        if (photoError) return null;
        if (!profile?.photo) return null;
        if (profile.photo.url) return profile.photo.url;

        const path = profile.photo.direccion_imagen;
        if (!path) return null;

        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }

        const base = (api.defaults.baseURL || '').replace(/\/api\/v1\/?$/, '');
        const cleanPath = path.replace(/^\/?(storage\/)?/, '');
        return `${base}/storage/${cleanPath}`;
    };

    // Get initials for profile badge fallback
    const getInitials = () => {
        if (profile?.identification?.primer_nombre) {
            return (profile.identification.primer_nombre[0] + profile.identification.apellido_paterno[0]).toUpperCase();
        }
        if (user?.name) {
            const parts = user.name.split(' ');
            return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : user.name.substring(0, 2).toUpperCase();
        }
        return 'E';
    };

    // Calculate Body Mass Index (IMC)
    const calculateBMI = (weight, height) => {
        if (!weight || !height) return { value: '—', text: '—', color: 'var(--text-secondary)' };
        const hMeters = parseFloat(height) / 100;
        const value = (parseFloat(weight) / (hMeters * hMeters)).toFixed(1);
        let text = 'Normal';
        let color = 'var(--success)';

        if (value < 18.5) {
            text = 'Bajo Peso';
            color = 'var(--warning)';
        } else if (value >= 25 && value < 30) {
            text = 'Sobrepeso';
            color = 'var(--warning)';
        } else if (value >= 30) {
            text = 'Obesidad';
            color = 'var(--accent)';
        }

        return { value, text, color };
    };

    const latestVitals = vitalsList.length > 0 ? vitalsList[0] : null;
    const currentBMI = latestVitals ? calculateBMI(latestVitals.peso, latestVitals.talla) : null;
    const isDocCedula = /^\d{10}$/.test(profile?.identification?.numero_cedula || '');

    // Format date in Spanish
    const formatSpanishDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const cleanStr = String(dateStr).slice(0, 10);
            const parts = cleanStr.split('-');
            if (parts.length === 3) {
                const year = parts[0];
                const month = Number(parts[1]) - 1;
                const day = Number(parts[2]);
                const months = [
                    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                ];
                if (!isNaN(day) && months[month]) {
                    return `${day} de ${months[month]}, ${year}`;
                }
            }
            return dateStr;
        } catch (e) {
            return dateStr;
        }
    };

    // Unify and format all patient prescriptions and indications across specialties
    const allPrescriptions = React.useMemo(() => {
        const list = [];

        // 1. Medicina General
        if (areaHistories.medicina) {
            areaHistories.medicina.forEach(x => {
                const dateStr = x.fecha || (x.created_at ? x.created_at.slice(0, 10) : '');
                if (x.type === 'evolucion' && (x.prescripcion_medica?.trim() || x.detalle_evolucion?.trim())) {
                    const docName = x.doctor ? `${x.doctor.datos_identificacion?.primer_nombre || x.doctor.datosIdentificacion?.primer_nombre || ''} ${x.doctor.datos_identificacion?.apellido_paterno || x.doctor.datosIdentificacion?.apellido_paterno || ''}`.trim() || x.doctor.name : 'Médico General';
                    list.push({
                        id: `med-ev-${x.id}`,
                        fecha: dateStr,
                        areaName: 'Medicina General',
                        areaKey: 'medicina',
                        doctorName: docName,
                        diagnostico: 'Evolución / Control de Consulta',
                        receta: x.prescripcion_medica || '',
                        indicaciones: x.detalle_evolucion || '',
                        rawRecord: x
                    });
                } else if (x.type === 'diario' && x.detalle_diagnostico?.trim()) {
                    const docName = x.doctor ? `${x.doctor.datos_identificacion?.primer_nombre || x.doctor.datosIdentificacion?.primer_nombre || ''} ${x.doctor.datos_identificacion?.apellido_paterno || x.doctor.datosIdentificacion?.apellido_paterno || ''}`.trim() || x.doctor.name : 'Médico General';
                    list.push({
                        id: `med-di-${x.id}`,
                        fecha: dateStr,
                        areaName: 'Medicina General',
                        areaKey: 'medicina',
                        doctorName: docName,
                        diagnostico: x.detalle_diagnostico,
                        receta: '',
                        indicaciones: 'Consulta general diaria de jornada.',
                        rawRecord: x
                    });
                }
            });
        }

        // 2. Psicología
        if (areaHistories.psicologia) {
            areaHistories.psicologia.forEach(x => {
                const dateStr = x.fecha || (x.created_at ? x.created_at.slice(0, 10) : '');
                if (x.type === 'evolucion' && (x.prescripcion_medica?.trim() || x.detalle_evolucion?.trim())) {
                    const docName = x.doctor ? `${x.doctor.datos_identificacion?.primer_nombre || x.doctor.datosIdentificacion?.primer_nombre || ''} ${x.doctor.datos_identificacion?.apellido_paterno || x.doctor.datosIdentificacion?.apellido_paterno || ''}`.trim() || x.doctor.name : 'Psicólogo/a';
                    list.push({
                        id: `psi-ev-${x.id}`,
                        fecha: dateStr,
                        areaName: 'Psicología Clínica',
                        areaKey: 'psicologia',
                        doctorName: docName,
                        diagnostico: `Sesión N° ${x.sesion_numero || 1}`,
                        receta: '',
                        indicaciones: `Recomendaciones: ${x.prescripcion_medica || ''}\nEvolución: ${x.detalle_evolucion || ''}`,
                        rawRecord: x
                    });
                } else if (x.type === 'diario' && x.detalle_diagnostico?.trim()) {
                    const docName = x.doctor ? `${x.doctor.datos_identificacion?.primer_nombre || x.doctor.datosIdentificacion?.primer_nombre || ''} ${x.doctor.datos_identificacion?.apellido_paterno || x.doctor.datosIdentificacion?.apellido_paterno || ''}`.trim() || x.doctor.name : 'Psicólogo/a';
                    list.push({
                        id: `psi-di-${x.id}`,
                        fecha: dateStr,
                        areaName: 'Psicología Clínica',
                        areaKey: 'psicologia',
                        doctorName: docName,
                        diagnostico: x.detalle_diagnostico,
                        receta: '',
                        indicaciones: 'Atención psicológica diaria.',
                        rawRecord: x
                    });
                }
            });
        }

        // 3. Odontología
        if (areaHistories.odontologia) {
            areaHistories.odontologia.forEach(x => {
                const dateStr = x.fecha || (x.created_at ? x.created_at.slice(0, 10) : '');
                if (x.type === 'evolucion' && (x.prescripción_farmaceutica?.trim() || x.detalle_procedimiento?.trim() || x.detalle_tratamiento?.trim())) {
                    const docName = x.doctor ? `${x.doctor.datos_identificacion?.primer_nombre || x.doctor.datosIdentificacion?.primer_nombre || ''} ${x.doctor.datos_identificacion?.apellido_paterno || x.doctor.datosIdentificacion?.apellido_paterno || ''}`.trim() || x.doctor.name : 'Odontólogo/a';
                    list.push({
                        id: `odo-ev-${x.id}`,
                        fecha: dateStr,
                        areaName: 'Odontología',
                        areaKey: 'odontologia',
                        doctorName: docName,
                        diagnostico: 'Evolución Dental',
                        receta: x.prescripción_farmaceutica || '',
                        indicaciones: `Tratamiento: ${x.detalle_tratamiento || ''}\nProcedimiento: ${x.detalle_procedimiento || ''}`,
                        rawRecord: x
                    });
                } else if (x.type === 'diario' && (x.detalle_diagnostico?.trim() || x.procedimiento?.trim())) {
                    const docName = x.doctor ? `${x.doctor.datos_identificacion?.primer_nombre || x.doctor.datosIdentificacion?.primer_nombre || ''} ${x.doctor.datos_identificacion?.apellido_paterno || x.doctor.datosIdentificacion?.apellido_paterno || ''}`.trim() || x.doctor.name : 'Odontólogo/a';
                    list.push({
                        id: `odo-di-${x.id}`,
                        fecha: dateStr,
                        areaName: 'Odontología',
                        areaKey: 'odontologia',
                        doctorName: docName,
                        diagnostico: x.detalle_diagnostico || 'Atención Odontológica',
                        receta: '',
                        indicaciones: `Procedimiento: ${x.procedimiento || 'General'}`,
                        rawRecord: x
                    });
                }
            });
        }

        // 4. Enfermería
        if (areaHistories.enfermeria) {
            areaHistories.enfermeria.forEach(x => {
                const dateStr = x.fecha || (x.created_at ? x.created_at.slice(0, 10) : '');
                if (x.type === 'diario' && (x.procedimiento?.nombre_procedimiento || x.detalle_procedimiento?.trim())) {
                    const docName = x.doctor ? `${x.doctor.datos_identificacion?.primer_nombre || x.doctor.datosIdentificacion?.primer_nombre || ''} ${x.doctor.datos_identificacion?.apellido_paterno || x.doctor.datosIdentificacion?.apellido_paterno || ''}`.trim() || x.doctor.name : 'Personal de Enfermería';
                    list.push({
                        id: `enf-di-${x.id}`,
                        fecha: dateStr,
                        areaName: 'Enfermería',
                        areaKey: 'enfermeria',
                        doctorName: docName,
                        diagnostico: x.procedimiento?.nombre_procedimiento || 'Procedimiento Realizado',
                        receta: '',
                        indicaciones: x.detalle_procedimiento || 'Procedimiento de enfermería diario.',
                        rawRecord: x
                    });
                }
            });
        }

        return list.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }, [areaHistories]);

    const filteredPrescriptions = React.useMemo(() => {
        let result = allPrescriptions;

        if (recetarioFilter !== 'Todos') {
            result = result.filter(p => p.areaName === recetarioFilter);
        }

        if (recetarioDate) {
            result = result.filter(p => {
                if (!p.fecha) return false;
                return p.fecha.slice(0, 10) === recetarioDate;
            });
        }

        return result;
    }, [allPrescriptions, recetarioFilter, recetarioDate]);

    const ITEMS_PER_PAGE = 9;
    const paginatedPrescriptions = React.useMemo(() => {
        const startIndex = (recetarioPage - 1) * ITEMS_PER_PAGE;
        return filteredPrescriptions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredPrescriptions, recetarioPage]);

    const totalPages = Math.ceil(filteredPrescriptions.length / ITEMS_PER_PAGE);

    // Filter appointments list by Month and Specialty
    const filteredCitasList = React.useMemo(() => {
        return (citasList || []).filter(cita => {
            if (citaFilterSpecialty !== 'todas' && cita.rol_doctor !== citaFilterSpecialty) {
                return false;
            }
            if (citaFilterMonth !== 'todos' && cita.fecha) {
                const cleanDate = String(cita.fecha).slice(0, 10);
                const parts = cleanDate.split('-');
                if (parts.length === 3 && parts[1] !== citaFilterMonth) {
                    return false;
                }
            }
            return true;
        });
    }, [citasList, citaFilterMonth, citaFilterSpecialty]);

    const totalCitaPages = Math.ceil(filteredCitasList.length / CITAS_PER_PAGE) || 1;

    const paginatedCitasList = React.useMemo(() => {
        const startIndex = (citaPage - 1) * CITAS_PER_PAGE;
        return filteredCitasList.slice(startIndex, startIndex + CITAS_PER_PAGE);
    }, [filteredCitasList, citaPage]);

    const activeUserTypes = (catalogs.tipos_usuario || [])
        .filter(t => [2, 3, 4, 5].includes(Number(t.id)))
        .map(t => ({
            id: t.id,
            nombre: t.nombre
        }));

    return (
        <div className="nurse-shell">
            <div className="app">
                <div className={`overlay ${isSidebarOpen ? 'show' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

                {/* SIDEBAR COLLAPSIBLE */}
                <aside className={`sidebar ${isSidebarOpen ? 'show' : ''}`}>
                    <div className="brand">
                        <div className="brand__logo">
                            <GraduationCap size={20} color="white" />
                        </div>
                        <div className="brand__text">
                            <strong>Portal</strong>
                            <span>Estudiante</span>
                        </div>
                        <button className="sidebar__close" onClick={() => setIsSidebarOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <p className="sidebar__label">MI ESPACIO DE SALUD</p>
                    <nav className="navigation">
                        <button
                            className={`navigation__item ${activeTab === 'portal' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('portal'); setIsSidebarOpen(false); }}
                            disabled={isRegistering}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><User size={18} /></span>
                            <span className="navigation__text">Mi Portal</span>
                        </button>

                        <button
                            className={`navigation__item ${activeTab === 'historial' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('historial'); setActiveSubTab('recetario'); setIsSidebarOpen(false); }}
                            disabled={!isProfileComplete() || isRegistering}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><ClipboardList size={18} /></span>
                            <span className="navigation__text">Recetario</span>
                        </button>

                        <button
                            className={`navigation__item ${activeTab === 'socioeconomica' ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); }}
                            disabled={true}
                            style={{ opacity: 0.45, cursor: 'not-allowed' }}
                            title="Pestaña desactivada temporalmente"
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><Coins size={18} /></span>
                            <span className="navigation__text">Ficha Socioeconómica</span>
                        </button>

                        <button
                            className={`navigation__item ${activeTab === 'citas' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('citas'); setIsSidebarOpen(false); }}
                            disabled={!isProfileComplete() || isRegistering}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><Calendar size={18} /></span>
                            <span className="navigation__text">Agendar Cita</span>
                        </button>
                    </nav>

                    <div className="sidebar__footer">
                        <button className="logout-button" onClick={logout}>
                            <span className="logout-button__icon"><LogOut size={18} /></span>
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTAINER */}
                <main className="main-content">
                    {/* TOPBAR */}
                    <header className="topbar">
                        <div className="topbar__left">
                            <button className="menu-button" onClick={() => setIsSidebarOpen(true)}>
                                <Menu size={20} />
                            </button>
                            <div>
                                <p className="breadcrumb">Estudiante / <span>{activeTab === 'portal' ? 'Panel Principal' : activeTab === 'citas' ? 'Citas Médicas' : activeTab === 'historial' ? 'Recetario' : 'Ficha Socioeconómica'}</span></p>
                                <h1>{activeTab === 'portal' ? 'Mi Portal de Salud' : activeTab === 'citas' ? 'Agendamiento y Citas' : activeTab === 'historial' ? 'Mi Recetario' : 'Ficha Socioeconómica UEB'}</h1>
                            </div>
                        </div>
                        <div className="topbar__right">
                            <NotificationMenu onNavigateToCitas={() => setActiveTab('citas')} />
                            <UserProfileMenu
                                avatarUrl={getPhotoUrl()}
                                onPhotoChange={handlePhotoChange}
                                isUploadingPhoto={uploadingPhoto}
                            />
                        </div>
                    </header>

                    <div className="content">
                        {/* SCENARIO A: STAGE 1 - PROFILE SETUP WIZARD */}
                        {isRegistering ? (
                            <div className="nurse-card span-12" style={{ padding: '32px', position: 'relative', maxWidth: '840px', margin: '0 auto', width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                                    <div>
                                        <span className="eyebrow" style={{ color: 'var(--accent)' }}>REGISTRO DE FICHA</span>
                                        <h2>Completa tu Perfil Médico-Académico</h2>
                                    </div>
                                    <span style={{ background: 'var(--primary-soft)', color: 'var(--primary)', fontWeight: 'bold', padding: '6px 12px', borderRadius: '20px', fontSize: '12px' }}>
                                        Paso {currentStep} de 4
                                    </span>
                                </div>

                                {/* PROGRESS BAR */}
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                                    {[1, 2, 3, 4].map(s => (
                                        <div
                                            key={s}
                                            style={{
                                                flex: 1,
                                                height: '6px',
                                                borderRadius: '3px',
                                                background: s <= currentStep ? 'linear-gradient(to right, var(--primary), var(--accent))' : 'var(--border)',
                                                transition: 'background-color 0.3s ease'
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* STEP 1: PERSONAL INFORMATION */}
                                {currentStep === 1 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <User size={18} color="var(--accent)" /> 1. Información de Identificación
                                            </h3>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Paso 1 de 4</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(183,26,52,0.04)', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(183,26,52,0.15)', marginBottom: '4px', opacity: !!profile?.identification?.numero_cedula ? 0.7 : 1 }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: !!profile?.identification?.numero_cedula ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '12.5px', color: 'var(--primary)', margin: 0 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={demographicForm.es_extranjero}
                                                    disabled={!!profile?.identification?.numero_cedula}
                                                    onChange={e => {
                                                        const isChecked = e.target.checked;
                                                        setDemographicForm(prev => ({
                                                            ...prev,
                                                            es_extranjero: isChecked,
                                                            nacionalidad: isChecked ? '' : 'Ecuatoriana'
                                                        }));
                                                        setPersonalForm(prev => ({ ...prev, numero_cedula: '' }));
                                                        setFormErrors(prev => ({ ...prev, numero_cedula: null }));
                                                    }}
                                                    style={{ width: '17px', height: '17px', cursor: !!profile?.identification?.numero_cedula ? 'not-allowed' : 'pointer', accentColor: 'var(--accent)' }}
                                                />
                                                <Globe size={16} color="var(--accent)" /> Soy estudiante o usuario extranjero (Usar Pasaporte)
                                            </label>
                                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                                                {demographicForm.es_extranjero ? 'Pasaporte' : 'Cédula Ecuatoriana'}
                                            </span>
                                        </div>

                                        <div className="clinical-fields-grid">
                                            <div className="premium-field-card">
                                                <div className="field-header">
                                                    <div className="field-header__left">
                                                        <span className="field-header__icon"><FileText size={15} /></span>
                                                        <h4 className="field-header__title">
                                                            {demographicForm.es_extranjero ? 'Número de Pasaporte' : 'Número de Cédula'} <span className="field-req-star">*</span>
                                                            {!!profile?.identification?.numero_cedula && <span style={{ marginLeft: '6px', color: 'var(--text-muted)', fontSize: '10px', fontWeight: 'normal' }}>(Campo Fijo)</span>}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    maxLength={demographicForm.es_extranjero ? 20 : 10}
                                                    value={personalForm.numero_cedula}
                                                    disabled={!!profile?.identification?.numero_cedula}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setPersonalForm({
                                                            ...personalForm,
                                                            numero_cedula: demographicForm.es_extranjero ? val.toUpperCase().trim() : val.replace(/\D/g, '')
                                                        });
                                                    }}
                                                    placeholder={demographicForm.es_extranjero ? "Ej. A1234567B" : "Ej. 0201234567"}
                                                    style={{
                                                        border: formErrors.numero_cedula ? '1.5px solid var(--accent)' : undefined,
                                                        background: !!profile?.identification?.numero_cedula ? '#f1f5f9' : undefined,
                                                        cursor: !!profile?.identification?.numero_cedula ? 'not-allowed' : undefined
                                                    }}
                                                />
                                                {formErrors.numero_cedula && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.numero_cedula}</small>}
                                            </div>

                                            <div className="premium-field-card">
                                                <div className="field-header">
                                                    <div className="field-header__left">
                                                        <span className="field-header__icon"><Calendar size={15} /></span>
                                                        <h4 className="field-header__title">
                                                            Fecha de Nacimiento <span className="field-req-star">*</span>
                                                            {!!profile?.identification?.numero_cedula && <span style={{ marginLeft: '6px', color: 'var(--text-muted)', fontSize: '10px', fontWeight: 'normal' }}>(Campo Fijo)</span>}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <input
                                                    type="date"
                                                    value={personalForm.fecha_nacimiento}
                                                    disabled={!!profile?.identification?.numero_cedula}
                                                    onChange={e => setPersonalForm({ ...personalForm, fecha_nacimiento: e.target.value })}
                                                    style={{
                                                        border: formErrors.fecha_nacimiento ? '1.5px solid var(--accent)' : undefined,
                                                        background: !!profile?.identification?.numero_cedula ? '#f1f5f9' : undefined,
                                                        cursor: !!profile?.identification?.numero_cedula ? 'not-allowed' : undefined
                                                    }}
                                                />
                                                {formErrors.fecha_nacimiento && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.fecha_nacimiento}</small>}
                                            </div>
                                        </div>

                                        <div className="clinical-fields-grid">
                                            <div className="premium-field-card">
                                                <div className="field-header">
                                                    <div className="field-header__left">
                                                        <span className="field-header__icon"><User size={15} /></span>
                                                        <h4 className="field-header__title">
                                                            Primer Nombre <span className="field-req-star">*</span>
                                                            {!!profile?.identification?.numero_cedula && <span style={{ marginLeft: '6px', color: 'var(--text-muted)', fontSize: '10px', fontWeight: 'normal' }}>(Campo Fijo)</span>}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={personalForm.primer_nombre}
                                                    disabled={!!profile?.identification?.numero_cedula}
                                                    onChange={e => setPersonalForm({ ...personalForm, primer_nombre: e.target.value })}
                                                    placeholder="Ej. Juan"
                                                    style={{
                                                        border: formErrors.primer_nombre ? '1.5px solid var(--accent)' : undefined,
                                                        background: !!profile?.identification?.numero_cedula ? '#f1f5f9' : undefined,
                                                        cursor: !!profile?.identification?.numero_cedula ? 'not-allowed' : undefined
                                                    }}
                                                />
                                                {formErrors.primer_nombre && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.primer_nombre}</small>}
                                            </div>

                                            <div className="premium-field-card">
                                                <div className="field-header">
                                                    <div className="field-header__left">
                                                        <span className="field-header__icon"><User size={15} /></span>
                                                        <h4 className="field-header__title">
                                                            Segundo Nombre
                                                            {!!profile?.identification?.numero_cedula && <span style={{ marginLeft: '6px', color: 'var(--text-muted)', fontSize: '10px', fontWeight: 'normal' }}>(Campo Fijo)</span>}
                                                        </h4>
                                                    </div>
                                                    <span className="field-badge-opt">Opcional</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={personalForm.segundo_nombre}
                                                    disabled={!!profile?.identification?.numero_cedula}
                                                    onChange={e => setPersonalForm({ ...personalForm, segundo_nombre: e.target.value })}
                                                    placeholder="Ej. Carlos"
                                                    style={{
                                                        background: !!profile?.identification?.numero_cedula ? '#f1f5f9' : undefined,
                                                        cursor: !!profile?.identification?.numero_cedula ? 'not-allowed' : undefined
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="clinical-fields-grid">
                                            <div className="premium-field-card">
                                                <div className="field-header">
                                                    <div className="field-header__left">
                                                        <span className="field-header__icon"><User size={15} /></span>
                                                        <h4 className="field-header__title">
                                                            Apellido Paterno <span className="field-req-star">*</span>
                                                            {!!profile?.identification?.numero_cedula && <span style={{ marginLeft: '6px', color: 'var(--text-muted)', fontSize: '10px', fontWeight: 'normal' }}>(Campo Fijo)</span>}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={personalForm.apellido_paterno}
                                                    disabled={!!profile?.identification?.numero_cedula}
                                                    onChange={e => setPersonalForm({ ...personalForm, apellido_paterno: e.target.value })}
                                                    placeholder="Ej. Pérez"
                                                    style={{
                                                        border: formErrors.apellido_paterno ? '1.5px solid var(--accent)' : undefined,
                                                        background: !!profile?.identification?.numero_cedula ? '#f1f5f9' : undefined,
                                                        cursor: !!profile?.identification?.numero_cedula ? 'not-allowed' : undefined
                                                    }}
                                                />
                                                {formErrors.apellido_paterno && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.apellido_paterno}</small>}
                                            </div>

                                            <div className="premium-field-card">
                                                <div className="field-header">
                                                    <div className="field-header__left">
                                                        <span className="field-header__icon"><User size={15} /></span>
                                                        <h4 className="field-header__title">
                                                            Apellido Materno
                                                            {!!profile?.identification?.numero_cedula && <span style={{ marginLeft: '6px', color: 'var(--text-muted)', fontSize: '10px', fontWeight: 'normal' }}>(Campo Fijo)</span>}
                                                        </h4>
                                                    </div>
                                                    <span className="field-badge-opt">Opcional</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={personalForm.apellido_materno}
                                                    disabled={!!profile?.identification?.numero_cedula}
                                                    onChange={e => setPersonalForm({ ...personalForm, apellido_materno: e.target.value })}
                                                    placeholder="Ej. López"
                                                    style={{
                                                        background: !!profile?.identification?.numero_cedula ? '#f1f5f9' : undefined,
                                                        cursor: !!profile?.identification?.numero_cedula ? 'not-allowed' : undefined
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: ACADEMIC DETAILS */}
                                {currentStep === 2 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <GraduationCap size={18} color="var(--accent)" /> 2. Datos Universitarios
                                            </h3>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Paso 2 de 4</span>
                                        </div>

                                        <div className="premium-field-card">
                                            <div className="field-header">
                                                <div className="field-header__left">
                                                    <span className="field-header__icon"><UserCheck size={15} /></span>
                                                    <h4 className="field-header__title">Tipo de Usuario Institucional <span className="field-req-star">*</span></h4>
                                                </div>
                                            </div>
                                            <select
                                                value={academicForm.id_tipo_usuario}
                                                onChange={e => {
                                                    const nextType = e.target.value;
                                                    setAcademicForm({
                                                        id_tipo_usuario: nextType,
                                                        id_facultad: '',
                                                        id_carrera: '',
                                                        id_ciclo: ''
                                                    });
                                                }}
                                                style={{ border: formErrors.id_tipo_usuario ? '1.5px solid var(--accent)' : undefined, width: '100%' }}
                                            >
                                                <option value="">Seleccione Tipo de Usuario</option>
                                                {activeUserTypes.map(t => (
                                                    <option key={t.id} value={t.id}>{t.nombre}</option>
                                                ))}
                                            </select>
                                            {formErrors.id_tipo_usuario && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.id_tipo_usuario}</small>}
                                        </div>

                                        {Number(academicForm.id_tipo_usuario) === 2 && (
                                            <>
                                                <div className="clinical-fields-grid">
                                                    <div className="premium-field-card">
                                                        <div className="field-header">
                                                            <div className="field-header__left">
                                                                <span className="field-header__icon"><GraduationCap size={15} /></span>
                                                                <h4 className="field-header__title">Facultad <span className="field-req-star">*</span></h4>
                                                            </div>
                                                        </div>
                                                        <select
                                                            value={academicForm.id_facultad}
                                                            onChange={e => setAcademicForm({ ...academicForm, id_facultad: e.target.value, id_carrera: '' })}
                                                            style={{ border: formErrors.id_facultad ? '1.5px solid var(--accent)' : undefined, width: '100%' }}
                                                        >
                                                            <option value="">Seleccione una Facultad</option>
                                                            {catalogs.facultades.map(f => (
                                                                <option key={f.id} value={f.id}>{f.nombre}</option>
                                                            ))}
                                                        </select>
                                                        {formErrors.id_facultad && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.id_facultad}</small>}
                                                    </div>

                                                    <div className="premium-field-card">
                                                        <div className="field-header">
                                                            <div className="field-header__left">
                                                                <span className="field-header__icon"><BookOpen size={15} /></span>
                                                                <h4 className="field-header__title">Carrera <span className="field-req-star">*</span></h4>
                                                            </div>
                                                        </div>
                                                        <select
                                                            value={academicForm.id_carrera}
                                                            onChange={e => setAcademicForm({ ...academicForm, id_carrera: e.target.value })}
                                                            disabled={!academicForm.id_facultad}
                                                            style={{ border: formErrors.id_carrera ? '1.5px solid var(--accent)' : undefined, width: '100%' }}
                                                        >
                                                            <option value="">Seleccione una Carrera</option>
                                                            {filteredCarreras.map(c => (
                                                                <option key={c.id} value={c.id}>{c.nombre}</option>
                                                            ))}
                                                        </select>
                                                        {formErrors.id_carrera && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.id_carrera}</small>}
                                                    </div>
                                                </div>

                                                <div className="premium-field-card">
                                                    <div className="field-header">
                                                        <div className="field-header__left">
                                                            <span className="field-header__icon"><Award size={15} /></span>
                                                            <h4 className="field-header__title">Ciclo / Semestre Actual <span className="field-req-star">*</span></h4>
                                                        </div>
                                                    </div>
                                                    <select
                                                        value={academicForm.id_ciclo}
                                                        onChange={e => setAcademicForm({ ...academicForm, id_ciclo: e.target.value })}
                                                        style={{ border: formErrors.id_ciclo ? '1.5px solid var(--accent)' : undefined, width: '100%' }}
                                                    >
                                                        <option value="">Seleccione un Semestre</option>
                                                        {catalogs.ciclos.map(ci => (
                                                            <option key={ci.id} value={ci.id}>{ci.numero} Semestre</option>
                                                        ))}
                                                    </select>
                                                    {formErrors.id_ciclo && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.id_ciclo}</small>}
                                                </div>
                                            </>
                                        )}

                                        {[3, 4].includes(Number(academicForm.id_tipo_usuario)) && (
                                            <div className="premium-field-card">
                                                <div className="field-header">
                                                    <div className="field-header__left">
                                                        <span className="field-header__icon"><GraduationCap size={15} /></span>
                                                        <h4 className="field-header__title">Facultad / Unidad de Adscripción <span className="field-req-star">*</span></h4>
                                                    </div>
                                                </div>
                                                <select
                                                    value={academicForm.id_facultad}
                                                    onChange={e => setAcademicForm({ ...academicForm, id_facultad: e.target.value })}
                                                    style={{ border: formErrors.id_facultad ? '1.5px solid var(--accent)' : undefined, width: '100%' }}
                                                >
                                                    <option value="">Seleccione una Facultad</option>
                                                    {catalogs.facultades.map(f => (
                                                        <option key={f.id} value={f.id}>{f.nombre}</option>
                                                    ))}
                                                </select>
                                                {formErrors.id_facultad && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.id_facultad}</small>}
                                            </div>
                                        )}

                                        {Number(academicForm.id_tipo_usuario) === 5 && (
                                            <div style={{ textAlign: 'center', padding: '24px', background: '#f8fafc', borderRadius: '14px', border: '1px dashed var(--border)', marginTop: '8px' }}>
                                                <Info size={24} style={{ color: 'var(--primary)', marginBottom: '8px', opacity: 0.7 }} />
                                                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                                                    No se requiere información académica adicional para personal de Código de Trabajo. Haz clic en "Siguiente" para continuar.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STEP 3: DEMOGRAPHICS AND ADDRESS */}
                                {currentStep === 3 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <MapPin size={18} color="var(--accent)" /> 3. Datos Demográficos y Residencia
                                            </h3>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Paso 3 de 4</span>
                                        </div>

                                        <div className="clinical-fields-grid">
                                            <div className="premium-field-card">
                                                <div className="field-header">
                                                    <div className="field-header__left">
                                                        <span className="field-header__icon"><User size={15} /></span>
                                                        <h4 className="field-header__title">Identificación de Género <span className="field-req-star">*</span></h4>
                                                    </div>
                                                </div>
                                                <select
                                                    value={demographicForm.id_genero}
                                                    onChange={e => setDemographicForm({ ...demographicForm, id_genero: e.target.value })}
                                                    style={{ border: formErrors.id_genero ? '1.5px solid var(--accent)' : undefined, width: '100%' }}
                                                >
                                                    <option value="">Seleccione</option>
                                                    {catalogs.generos.map(g => (
                                                        <option key={g.id} value={g.id}>{g.nombre}</option>
                                                    ))}
                                                </select>
                                                {formErrors.id_genero && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.id_genero}</small>}
                                            </div>

                                            <div className="premium-field-card">
                                                <div className="field-header">
                                                    <div className="field-header__left">
                                                        <span className="field-header__icon"><Heart size={15} /></span>
                                                        <h4 className="field-header__title">Estado Civil <span className="field-req-star">*</span></h4>
                                                    </div>
                                                </div>
                                                <select
                                                    value={demographicForm.id_estado_civil}
                                                    onChange={e => setDemographicForm({ ...demographicForm, id_estado_civil: e.target.value })}
                                                    style={{ border: formErrors.id_estado_civil ? '1.5px solid var(--accent)' : undefined, width: '100%' }}
                                                >
                                                    <option value="">Seleccione</option>
                                                    {catalogs.estados_civil.map(ec => (
                                                        <option key={ec.id} value={ec.id}>{ec.nombres || ec.nombre || ec.nombre_estado_civil || ec.nombre_estado || 'Estado Civil'}</option>
                                                    ))}
                                                </select>
                                                {formErrors.id_estado_civil && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.id_estado_civil}</small>}
                                            </div>
                                        </div>

                                        <div className="clinical-fields-grid">
                                            <div className="premium-field-card">
                                                <div className="field-header">
                                                    <div className="field-header__left">
                                                        <span className="field-header__icon"><Globe size={15} /></span>
                                                        <h4 className="field-header__title">Autoidentificación Étnica <span className="field-req-star">*</span></h4>
                                                    </div>
                                                </div>
                                                <select
                                                    value={demographicForm.id_identificacion_etnica}
                                                    onChange={e => setDemographicForm({ ...demographicForm, id_identificacion_etnica: e.target.value })}
                                                    style={{ border: formErrors.id_identificacion_etnica ? '1.5px solid var(--accent)' : undefined, width: '100%' }}
                                                >
                                                    <option value="">Seleccione</option>
                                                    {catalogs.etnias.map(et => (
                                                        <option key={et.id} value={et.id}>{et.nombre}</option>
                                                    ))}
                                                </select>
                                                {formErrors.id_identificacion_etnica && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.id_identificacion_etnica}</small>}
                                            </div>

                                            <div className="premium-field-card">
                                                <div className="field-header">
                                                    <div className="field-header__left">
                                                        <span className="field-header__icon"><Globe size={15} /></span>
                                                        <h4 className="field-header__title">Nacionalidad <span className="field-req-star">*</span></h4>
                                                    </div>
                                                </div>
                                                {demographicForm.es_extranjero ? (
                                                    <select
                                                        value={demographicForm.nacionalidad}
                                                        onChange={e => setDemographicForm({ ...demographicForm, nacionalidad: e.target.value })}
                                                        style={{ width: '100%' }}
                                                    >
                                                        <option value="">-- Seleccione un país --</option>
                                                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value="Ecuatoriana"
                                                        disabled
                                                        style={{
                                                            backgroundColor: '#f1f5f9',
                                                            cursor: 'not-allowed'
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            <div className="premium-field-card" style={{ gridColumn: 'span 2' }}>
                                                <div className="field-header">
                                                    <div className="field-header__left">
                                                        <span className="field-header__icon"><Droplet size={15} color="var(--accent)" /></span>
                                                        <h4 className="field-header__title">Tipo de Sangre</h4>
                                                    </div>
                                                    <span className="field-badge-opt">Opcional</span>
                                                </div>
                                                <select
                                                    value={demographicForm.id_tipo_sangre || ''}
                                                    onChange={e => setDemographicForm({ ...demographicForm, id_tipo_sangre: e.target.value })}
                                                    style={{ width: '100%' }}
                                                >
                                                    <option value="">Seleccione su tipo de sangre (si lo conoce)</option>
                                                    {(catalogs.tipos_sangre && catalogs.tipos_sangre.length > 0) ? (
                                                        catalogs.tipos_sangre.map(ts => (
                                                            <option key={ts.id} value={ts.id}>{ts.nombre}</option>
                                                        ))
                                                    ) : (
                                                        <>
                                                            <option value="1">A+</option>
                                                            <option value="2">A-</option>
                                                            <option value="3">B+</option>
                                                            <option value="4">B-</option>
                                                            <option value="5">AB+</option>
                                                            <option value="6">AB-</option>
                                                            <option value="7">O+</option>
                                                            <option value="8">O-</option>
                                                        </>
                                                    )}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mental-cluster" style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0,32,64,0.1)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Globe size={16} color="var(--primary)" /> Lugar de Nacimiento
                                                </h4>
                                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                                                    {demographicForm.es_extranjero ? 'Identificado como Extranjero' : 'Identificado como Ecuatoriano'}
                                                </span>
                                            </div>

                                            <div className="clinical-fields-grid" style={{ marginBottom: '20px' }}>
                                                {!demographicForm.es_extranjero ? (
                                                    <>
                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><MapPin size={15} /></span>
                                                                    <h4 className="field-header__title">Provincia de Nacimiento <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <select
                                                                value={demographicForm.id_provincia_nacimiento}
                                                                onChange={e => setDemographicForm({ ...demographicForm, id_provincia_nacimiento: e.target.value, id_canton_nacimiento: '' })}
                                                                style={{ border: formErrors.id_provincia_nacimiento ? '1.5px solid var(--accent)' : undefined, width: '100%' }}
                                                            >
                                                                <option value="">Seleccione Provincia de Nacimiento</option>
                                                                {catalogs.provincias.map(pr => (
                                                                    <option key={pr.id} value={pr.id}>{pr.nombre}</option>
                                                                ))}
                                                            </select>
                                                            {formErrors.id_provincia_nacimiento && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.id_provincia_nacimiento}</small>}
                                                        </div>

                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><MapPin size={15} /></span>
                                                                    <h4 className="field-header__title">Cantón de Nacimiento <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <select
                                                                value={demographicForm.id_canton_nacimiento}
                                                                onChange={e => setDemographicForm({ ...demographicForm, id_canton_nacimiento: e.target.value })}
                                                                disabled={!demographicForm.id_provincia_nacimiento}
                                                                style={{ border: formErrors.id_canton_nacimiento ? '1.5px solid var(--accent)' : undefined, width: '100%' }}
                                                            >
                                                                <option value="">Seleccione Cantón de Nacimiento</option>
                                                                {filteredCantonesNacimiento.map(ct => (
                                                                    <option key={ct.id} value={ct.id}>{ct.nombre}</option>
                                                                ))}
                                                            </select>
                                                            {formErrors.id_canton_nacimiento && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.id_canton_nacimiento}</small>}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="premium-field-card" style={{ gridColumn: 'span 2' }}>
                                                        <div className="field-header">
                                                            <div className="field-header__left">
                                                                <span className="field-header__icon"><Globe size={15} /></span>
                                                                <h4 className="field-header__title">País de Origen / Nacimiento <span className="field-req-star">*</span></h4>
                                                            </div>
                                                        </div>
                                                        <select
                                                            value={demographicForm.nacionalidad}
                                                            onChange={e => setDemographicForm({ ...demographicForm, nacionalidad: e.target.value })}
                                                            style={{ width: '100%' }}
                                                        >
                                                            <option value="">-- Seleccione un país --</option>
                                                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                                <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Home size={16} /> Dirección de Residencia Actual
                                                </h4>
                                            </div>

                                            <div className="clinical-fields-grid">
                                                {!demographicForm.es_extranjero && (
                                                    <>
                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><MapPin size={15} /></span>
                                                                    <h4 className="field-header__title">Provincia <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <select
                                                                value={demographicForm.id_provincia}
                                                                onChange={e => setDemographicForm({ ...demographicForm, id_provincia: e.target.value, id_canton: '' })}
                                                                style={{ border: formErrors.id_provincia ? '1.5px solid var(--accent)' : undefined, width: '100%' }}
                                                            >
                                                                <option value="">Seleccione una Provincia</option>
                                                                {catalogs.provincias.map(pr => (
                                                                    <option key={pr.id} value={pr.id}>{pr.nombre}</option>
                                                                ))}
                                                            </select>
                                                            {formErrors.id_provincia && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.id_provincia}</small>}
                                                        </div>

                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><MapPin size={15} /></span>
                                                                    <h4 className="field-header__title">Cantón <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <select
                                                                value={demographicForm.id_canton}
                                                                onChange={e => setDemographicForm({ ...demographicForm, id_canton: e.target.value })}
                                                                disabled={!demographicForm.id_provincia}
                                                                style={{ border: formErrors.id_canton ? '1.5px solid var(--accent)' : undefined, width: '100%' }}
                                                            >
                                                                <option value="">Seleccione un Cantón</option>
                                                                {filteredCantones.map(ct => (
                                                                    <option key={ct.id} value={ct.id}>{ct.nombre}</option>
                                                                ))}
                                                            </select>
                                                            {formErrors.id_canton && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.id_canton}</small>}
                                                        </div>
                                                    </>
                                                )}

                                                <div className="premium-field-card">
                                                    <div className="field-header">
                                                        <div className="field-header__left">
                                                            <span className="field-header__icon"><Home size={15} /></span>
                                                            <h4 className="field-header__title">Dirección Referencial (Calles / Barrio) <span className="field-req-star">*</span></h4>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={demographicForm.direccion_referencia}
                                                        onChange={e => setDemographicForm({ ...demographicForm, direccion_referencia: e.target.value })}
                                                        placeholder="Ej. Calle 10 de Agosto y Rocafuerte, Barrio Central"
                                                        style={{ border: formErrors.direccion_referencia ? '1.5px solid var(--accent)' : undefined }}
                                                    />
                                                    {formErrors.direccion_referencia && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.direccion_referencia}</small>}
                                                </div>

                                                <div className="premium-field-card">
                                                    <div className="field-header">
                                                        <div className="field-header__left">
                                                            <span className="field-header__icon"><Phone size={15} /></span>
                                                            <h4 className="field-header__title">Teléfono Fijo / Convencional</h4>
                                                        </div>
                                                        <span className="field-badge-opt">Opcional</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={demographicForm.telefono_convencional}
                                                        onChange={e => setDemographicForm({ ...demographicForm, telefono_convencional: e.target.value })}
                                                        placeholder="Ej. 022987654"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4: EMERGENCY CONTACT & EXTRA OPTIONS */}
                                {currentStep === 4 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <h3 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <ShieldAlert size={18} color="var(--accent)" /> 4. Contacto de Emergencia e Indicadores Médicos
                                            </h3>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Paso 4 de 4</span>
                                        </div>

                                        <div style={{ background: '#fff0f2', padding: '20px', borderRadius: '16px', border: '1px solid #fed7da', marginBottom: '16px' }}>
                                            <h4 style={{ margin: '0 0 16px 0', color: 'var(--accent)', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Phone size={16} /> Contacto de Emergencia Obligatorio
                                            </h4>

                                            <div className="clinical-fields-grid">
                                                <div className="premium-field-card">
                                                    <div className="field-header">
                                                        <div className="field-header__left">
                                                            <span className="field-header__icon"><User size={15} /></span>
                                                            <h4 className="field-header__title">Nombre Completo <span className="field-req-star">*</span></h4>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={emergencyForm.nombre_completo}
                                                        onChange={e => setEmergencyForm({ ...emergencyForm, nombre_completo: e.target.value })}
                                                        placeholder="Ej. María López"
                                                        style={{ border: formErrors.emergency_nombre ? '1.5px solid var(--accent)' : undefined }}
                                                    />
                                                    {formErrors.emergency_nombre && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.emergency_nombre}</small>}
                                                </div>

                                                <div className="premium-field-card">
                                                    <div className="field-header">
                                                        <div className="field-header__left">
                                                            <span className="field-header__icon"><UserCheck size={15} /></span>
                                                            <h4 className="field-header__title">Parentesco (Relación) <span className="field-req-star">*</span></h4>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={emergencyForm.parentesco}
                                                        onChange={e => setEmergencyForm({ ...emergencyForm, parentesco: e.target.value })}
                                                        placeholder="Ej. Madre, Padre, Cónyuge"
                                                        style={{ border: formErrors.emergency_parentesco ? '1.5px solid var(--accent)' : undefined }}
                                                    />
                                                    {formErrors.emergency_parentesco && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.emergency_parentesco}</small>}
                                                </div>

                                                <div className="premium-field-card">
                                                    <div className="field-header">
                                                        <div className="field-header__left">
                                                            <span className="field-header__icon"><Phone size={15} /></span>
                                                            <h4 className="field-header__title">Teléfono Principal <span className="field-req-star">*</span></h4>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={emergencyForm.telefono}
                                                        onChange={e => setEmergencyForm({ ...emergencyForm, telefono: e.target.value })}
                                                        placeholder="Ej. 0998877665"
                                                        style={{ border: formErrors.emergency_telefono ? '1.5px solid var(--accent)' : undefined }}
                                                    />
                                                    {formErrors.emergency_telefono && <small style={{ color: 'var(--accent)', display: 'block', fontSize: '10px', marginTop: '2px' }}>{formErrors.emergency_telefono}</small>}
                                                </div>

                                                <div className="premium-field-card">
                                                    <div className="field-header">
                                                        <div className="field-header__left">
                                                            <span className="field-header__icon"><Phone size={15} /></span>
                                                            <h4 className="field-header__title">Celular Alterno</h4>
                                                        </div>
                                                        <span className="field-badge-opt">Opcional</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={emergencyForm.celular}
                                                        onChange={e => setEmergencyForm({ ...emergencyForm, celular: e.target.value })}
                                                        placeholder="Ej. 0988776655"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="clinical-fields-grid">
                                            <div className="field">
                                                <span>¿Tienes Hijos? (Indica cantidad)</span>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={extraForm.numero_hijos}
                                                    onChange={e => setExtraForm({ ...extraForm, numero_hijos: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div className="field" style={{ gridColumn: 'span 2' }}>
                                                <span>¿Alergias Conocidas? (Separadas por comas)</span>
                                                <input
                                                    type="text"
                                                    value={extraForm.alergias}
                                                    onChange={e => setExtraForm({ ...extraForm, alergias: e.target.value })}
                                                    placeholder="Ej. Penicilina, Mariscos, Ninguna"
                                                />
                                            </div>
                                            <div className="field" style={{ gridColumn: 'span 3' }}>
                                                <span>¿Tienes alguna Discapacidad? (Indicar cuál o dejar vacío)</span>
                                                <input
                                                    type="text"
                                                    value={extraForm.discapacidades}
                                                    onChange={e => setExtraForm({ ...extraForm, discapacidades: e.target.value })}
                                                    placeholder="Ej. Discapacidad visual leve, Ninguna"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* UNIFIED ACTIONS FOOTER WITH CLINICAL BUTTONS */}
                                <footer className="clinical-modal__actions" style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                    {currentStep > 1 ? (
                                        <button
                                            className="action-button action-button--light"
                                            onClick={handleBack}
                                            type="button"
                                        >
                                            Atrás
                                        </button>
                                    ) : (
                                        <button
                                            className="action-button action-button--danger"
                                            onClick={() => setIsRegistering(false)}
                                            type="button"
                                        >
                                            Cancelar
                                        </button>
                                    )}

                                    {currentStep < 4 ? (
                                        <button
                                            className="action-button action-button--primary"
                                            onClick={handleNext}
                                            type="button"
                                        >
                                            Siguiente
                                        </button>
                                    ) : (
                                        <button
                                            className="action-button action-button--success"
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            type="button"
                                        >
                                            {saving ? 'Guardando...' : 'Completar Registro'}
                                        </button>
                                    )}
                                </footer>
                            </div>
                        ) : (
                            /* SCENARIO B: PORTAL / REGULAR STUDENT WORKFLOW */
                            <div>
                                {/* IF PROFILE INCOMPLETE: SHOW ONBOARDING CARD WITH 'Iniciar Registro' */}
                                {!isProfileComplete() ? (
                                    <div className="nurse-card span-12" style={{ padding: '40px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', color: 'white', overflow: 'hidden', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                                        <div style={{ position: 'absolute', bottom: '-80px', left: '10%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(183, 26, 52, 0.1)' }} />

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative', zIndex: 2 }}>
                                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                                <GraduationCap size={44} color="var(--accent)" />
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Portal de Bienestar Universitario</span>
                                                <h2 style={{ fontSize: '26px', margin: '4px 0 10px', color: 'white' }}>¡Bienvenido, {user?.name || user?.email}!</h2>
                                                <p style={{ maxWidth: '750px', fontSize: '14px', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                                                    Para poder acceder a tu historial clínico, consultar recetas, visualizar atenciones de enfermería, medicina general, odontología o psicología, es de carácter obligatorio completar los datos de tu ficha de registro. Este proceso toma menos de 3 minutos.
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-start', position: 'relative', zIndex: 2 }}>
                                            <button
                                                className="btn"
                                                onClick={() => setIsRegistering(true)}
                                                style={{
                                                    background: 'linear-gradient(to right, var(--accent), var(--accent-dark))',
                                                    color: 'white',
                                                    padding: '14px 28px',
                                                    fontSize: '13px',
                                                    fontWeight: 'bold',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 8px 24px rgba(183, 26, 52, 0.4)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.2s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <span>Iniciar Registro de Perfil</span>
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* IF PROFILE COMPLETE AND PORTAL TAB ACTIVE */
                                    activeTab === 'portal' && (
                                        <div className="module-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>

                                            {/* COMPONENT 1: TARJETA BLANCA MÉDICA INSTITUCIONAL */}
                                            <div
                                                className="nurse-card span-8"
                                                style={{
                                                    padding: '24px 28px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    backgroundColor: '#ffffff',
                                                    border: '1px solid var(--border, #e2e8f0)',
                                                    borderRadius: '16px',
                                                    boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06))',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {/* Header & Identification */}
                                                <div>
                                                    {/* Top Badges & Actions */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                padding: '4px 10px',
                                                                borderRadius: '20px',
                                                                background: 'var(--primary-soft, #eaf0f5)',
                                                                color: 'var(--primary, #002040)',
                                                                fontSize: '11px',
                                                                fontWeight: '750',
                                                                letterSpacing: '0.4px',
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                <GraduationCap size={13} style={{ color: 'var(--primary, #002040)' }} />
                                                                Portal del Estudiante • UEB
                                                            </span>
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '5px',
                                                                padding: '4px 10px',
                                                                borderRadius: '20px',
                                                                background: '#dcfce7',
                                                                color: '#15803d',
                                                                fontSize: '11px',
                                                                fontWeight: '700'
                                                            }}>
                                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span>
                                                                Ficha Médica Activa
                                                            </span>
                                                        </div>

                                                        {/* Action buttons */}
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsViewFichaOpen(true)}
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    padding: '7px 14px',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #cbd5e1',
                                                                    background: '#ffffff',
                                                                    color: 'var(--text-primary, #1e293b)',
                                                                    fontSize: '12px',
                                                                    fontWeight: '650',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s ease',
                                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                                                                }}
                                                                onMouseEnter={e => {
                                                                    e.currentTarget.style.background = '#f8fafc';
                                                                    e.currentTarget.style.borderColor = '#94a3b8';
                                                                }}
                                                                onMouseLeave={e => {
                                                                    e.currentTarget.style.background = '#ffffff';
                                                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                                                }}
                                                            >
                                                                <Eye size={14} style={{ color: 'var(--primary, #002040)' }} />
                                                                <span>Ver Ficha</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIsRegistering(true);
                                                                    setCurrentStep(1);
                                                                }}
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    padding: '7px 14px',
                                                                    borderRadius: '8px',
                                                                    border: 'none',
                                                                    background: 'linear-gradient(135deg, var(--primary, #002040), #0d3b66)',
                                                                    color: '#ffffff',
                                                                    fontSize: '12px',
                                                                    fontWeight: '650',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s ease',
                                                                    boxShadow: '0 2px 6px rgba(0,32,64,0.18)'
                                                                }}
                                                                onMouseEnter={e => {
                                                                    e.currentTarget.style.opacity = '0.92';
                                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                                }}
                                                                onMouseLeave={e => {
                                                                    e.currentTarget.style.opacity = '1';
                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                }}
                                                            >
                                                                <Edit3 size={14} />
                                                                <span>Editar Ficha</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Student Name & Program */}
                                                    <div>
                                                        <h2 style={{
                                                            margin: 0,
                                                            fontSize: '22px',
                                                            fontWeight: '800',
                                                            color: 'var(--primary, #002040)',
                                                            letterSpacing: '-0.3px',
                                                            lineHeight: '1.25'
                                                        }}>
                                                            {profile?.identification?.primer_nombre} {profile?.identification?.segundo_nombre} {profile?.identification?.apellido_paterno} {profile?.identification?.apellido_materno}
                                                        </h2>
                                                        <p style={{
                                                            margin: '4px 0 0',
                                                            color: 'var(--text-muted, #64748b)',
                                                            fontSize: '13px',
                                                            fontWeight: '500',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}>
                                                            <span>{profile?.career_study?.tipo_usuario?.nombre || 'Estudiante Regular'}</span>
                                                            <span style={{ opacity: 0.4 }}>•</span>
                                                            <span style={{ color: 'var(--primary, #002040)', fontWeight: '600' }}>Dirección de Bienestar Universitario</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Bottom Row: Clean, Unboxed Academic Metadata */}
                                                <div style={{
                                                    marginTop: '22px',
                                                    paddingTop: '18px',
                                                    borderTop: '1px solid var(--border, #e2e8f0)',
                                                    display: 'grid',
                                                    gridTemplateColumns: '130px 1.5fr 1fr',
                                                    gap: '24px',
                                                    alignItems: 'flex-start'
                                                }}>
                                                    {/* Data 1: Identification */}
                                                    <div>
                                                        <span style={{
                                                            display: 'block',
                                                            fontSize: '10.5px',
                                                            textTransform: 'uppercase',
                                                            color: 'var(--text-muted, #64748b)',
                                                            fontWeight: '700',
                                                            letterSpacing: '0.4px',
                                                            marginBottom: '3px'
                                                        }}>
                                                            {isDocCedula ? 'Cédula de Identidad' : 'Pasaporte'}
                                                        </span>
                                                        <strong style={{
                                                            fontSize: '14px',
                                                            color: 'var(--text-primary, #0f172a)',
                                                            fontWeight: '750',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            {profile?.identification?.numero_cedula || '—'}
                                                        </strong>
                                                    </div>

                                                    {/* Data 2: Faculty */}
                                                    <div>
                                                        <span style={{
                                                            display: 'block',
                                                            fontSize: '10.5px',
                                                            textTransform: 'uppercase',
                                                            color: 'var(--text-muted, #64748b)',
                                                            fontWeight: '700',
                                                            letterSpacing: '0.4px',
                                                            marginBottom: '3px'
                                                        }}>
                                                            Facultad / Unidad Académica
                                                        </span>
                                                        <strong style={{
                                                            fontSize: '13px',
                                                            color: 'var(--text-primary, #0f172a)',
                                                            fontWeight: '650',
                                                            lineHeight: '1.4',
                                                            display: 'block'
                                                        }}>
                                                            {profile?.career_study?.facultad?.nombre || 'No Aplica'}
                                                        </strong>
                                                    </div>

                                                    {/* Data 3: Career & Cycle */}
                                                    <div>
                                                        <span style={{
                                                            display: 'block',
                                                            fontSize: '10.5px',
                                                            textTransform: 'uppercase',
                                                            color: 'var(--text-muted, #64748b)',
                                                            fontWeight: '700',
                                                            letterSpacing: '0.4px',
                                                            marginBottom: '3px'
                                                        }}>
                                                            {Number(profile?.career_study?.id_tipo_usuario) === 2 ? 'Carrera y Ciclo' : 'Tipo de Usuario'}
                                                        </span>
                                                        <strong style={{
                                                            fontSize: '13px',
                                                            color: 'var(--primary, #002040)',
                                                            fontWeight: '700',
                                                            lineHeight: '1.4',
                                                            display: 'block'
                                                        }}>
                                                            {Number(profile?.career_study?.id_tipo_usuario) === 2
                                                                ? (profile?.career_study?.carrera?.nombre
                                                                    ? `${profile.career_study.carrera.nombre} - Ciclo ${profile?.career_study?.ciclo?.numero || 'S/C'}`
                                                                    : '—')
                                                                : (profile?.career_study?.tipo_usuario?.nombre || 'General')
                                                            }
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* COMPONENT 2: QUICK HEALTH METRICS BADGES */}
                                            <div className="nurse-card span-4" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px', fontWeight: 'bold' }}>Alertas Clínicas</h3>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--accent-soft)', padding: '10px 14px', borderRadius: '8px' }}>
                                                        <ShieldAlert size={18} color="var(--accent)" />
                                                        <div style={{ fontSize: '12px' }}>
                                                            <span style={{ display: 'block', color: 'var(--accent)', fontWeight: 'bold' }}>Alergias Declaradas</span>
                                                            <strong style={{ color: 'var(--text-primary)' }}>
                                                                {extraForm.alergias || 'Ninguna declarada'}
                                                            </strong>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--primary-soft)', padding: '10px 14px', borderRadius: '8px' }}>
                                                        <Activity size={18} color="var(--primary)" />
                                                        <div style={{ fontSize: '12px' }}>
                                                            <span style={{ display: 'block', color: 'var(--primary)', fontWeight: 'bold' }}>Discapacidades</span>
                                                            <strong style={{ color: 'var(--text-primary)' }}>
                                                                {extraForm.discapacidades || 'Ninguna declarada'}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* COMPONENT 4: EMERGENCY CONTACT INFO */}
                                            <div className="nurse-card span-6" style={{ padding: '24px' }}>
                                                <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--accent)', borderBottom: '1px solid var(--border)', paddingBottom: '8px', fontWeight: 'bold' }}>
                                                    En Caso de Emergencia Contactar a:
                                                </h3>
                                                {profile?.emergency_contacts && profile.emergency_contacts.length > 0 ? (
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                        <div>
                                                            <small style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '10px' }}>Nombre del Contacto</small>
                                                            <strong style={{ fontSize: '13px' }}>{profile.emergency_contacts[0].nombre_completo}</strong>
                                                        </div>
                                                        <div>
                                                            <small style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '10px' }}>Relación / Parentesco</small>
                                                            <strong style={{ fontSize: '13px' }}>{profile.emergency_contacts[0].parentesco}</strong>
                                                        </div>
                                                        <div>
                                                            <small style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '10px' }}>Teléfono Primario</small>
                                                            <strong style={{ fontSize: '13px' }}><Phone size={12} style={{ display: 'inline', marginRight: '4px' }} /> {profile.emergency_contacts[0].telefono}</strong>
                                                        </div>
                                                        {profile.emergency_contacts[0].celular && (
                                                            <div>
                                                                <small style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '10px' }}>Celular Alterno</small>
                                                                <strong style={{ fontSize: '13px' }}>{profile.emergency_contacts[0].celular}</strong>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '12px' }}>No hay contacto registrado.</p>
                                                )}
                                            </div>

                                            {/* COMPONENT 5: RESIDENCE INFO */}
                                            <div className="nurse-card span-6" style={{ padding: '24px' }}>
                                                <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px', fontWeight: 'bold' }}>
                                                    Dirección Domiciliaria Registrada:
                                                </h3>
                                                {(() => {
                                                    const activeAddress = profile?.addresses?.find(a => Number(a.id_tipo_direccion) === 2) || profile?.addresses?.[0];
                                                    if (!activeAddress) {
                                                        return <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '12px' }}>No hay dirección registrada.</p>;
                                                    }
                                                    return (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <MapPin size={16} color="var(--primary)" />
                                                                <span style={{ fontSize: '13px' }}>
                                                                    {activeAddress.es_extranjero ? (
                                                                        <strong>Extranjero / {activeAddress.nacionalidad}</strong>
                                                                    ) : (
                                                                        <strong>{activeAddress.provincia?.nombre} - {activeAddress.canton?.nombre}</strong>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <p style={{ margin: '4px 0 0 24px', fontStyle: 'italic', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                                {activeAddress.direccion_referencia}
                                                            </p>
                                                            {activeAddress.telefono_convencional && (
                                                                <span style={{ margin: '0 0 0 24px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                                    Teléfono Fijo: {activeAddress.telefono_convencional}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                        </div>
                                    )
                                )}

                                {/* SCENARIO C: RECETARIO CLÍNICO */}
                                {activeTab === 'historial' && isProfileComplete() && (
                                    <div className="nurse-card span-12" style={{ padding: '28px', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                                        {/* HEADER */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                                            <div>
                                                <h2 style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <ClipboardList size={22} color="var(--accent)" /> Recetario Clínico e Indicaciones
                                                </h2>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '4px 0 0' }}>
                                                    Consulta todas las recetas, indicaciones de tratamiento y recomendaciones emitidas por cada especialidad médica.
                                                </p>
                                            </div>
                                        </div>

                                        {/* FILTER BUTTONS ROW */}
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                            {['Todos', 'Medicina General', 'Psicología Clínica', 'Odontología', 'Enfermería'].map(area => {
                                                const count = area === 'Todos'
                                                    ? allPrescriptions.length
                                                    : allPrescriptions.filter(p => p.areaName === area).length;

                                                const isActive = recetarioFilter === area;

                                                return (
                                                    <button
                                                        key={area}
                                                        onClick={() => setRecetarioFilter(area)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            border: isActive ? 'none' : '1px solid var(--border)',
                                                            background: isActive ? 'linear-gradient(135deg, var(--primary), var(--primary-light))' : 'white',
                                                            color: isActive ? 'white' : 'var(--text-primary)',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            boxShadow: isActive ? '0 4px 12px rgba(11, 34, 64, 0.2)' : 'none',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={e => {
                                                            if (!isActive) e.currentTarget.style.background = '#f8fafc';
                                                        }}
                                                        onMouseLeave={e => {
                                                            if (!isActive) e.currentTarget.style.background = 'white';
                                                        }}
                                                    >
                                                        {area}
                                                        <span style={{
                                                            background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--border)',
                                                            color: isActive ? 'white' : 'var(--text-secondary)',
                                                            padding: '2px 6px',
                                                            borderRadius: '10px',
                                                            fontSize: '10px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {count}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* DATE RANGE FILTER ROW */}
                                        <div style={{
                                            background: '#f8fafc',
                                            padding: '14px 18px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            display: 'flex',
                                            gap: '16px',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            marginBottom: '24px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Calendar size={16} color="var(--primary)" />
                                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Seleccionar fecha:</span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                <input
                                                    type="date"
                                                    value={recetarioDate}
                                                    onChange={e => setRecetarioDate(e.target.value)}
                                                    style={{
                                                        padding: '6px 10px',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--border)',
                                                        fontSize: '12px',
                                                        outline: 'none',
                                                        color: 'var(--text-primary)',
                                                        background: 'white'
                                                    }}
                                                />

                                                {recetarioDate && (
                                                    <button
                                                        onClick={() => setRecetarioDate('')}
                                                        style={{
                                                            background: '#fee2e2',
                                                            color: '#ef4444',
                                                            border: 'none',
                                                            padding: '6px 12px',
                                                            borderRadius: '8px',
                                                            fontSize: '11px',
                                                            fontWeight: 'bold',
                                                            cursor: 'pointer',
                                                            transition: 'background 0.2s'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                                                        onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
                                                    >
                                                        Limpiar Fecha
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* PRESCRIPTIONS LIST / GRID */}
                                        {paginatedPrescriptions.length > 0 ? (
                                            <div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                                                    {paginatedPrescriptions.map(item => {
                                                        const isMedicine = item.areaKey === 'medicina';
                                                        const isPsychology = item.areaKey === 'psicologia';
                                                        const isDentist = item.areaKey === 'odontologia';
                                                        const isNurse = item.areaKey === 'enfermeria';

                                                        const themeColor = isMedicine ? 'var(--primary)' :
                                                            isPsychology ? '#8b5cf6' :
                                                                isDentist ? '#10b981' : '#f97316';

                                                        const themeBgSoft = isMedicine ? 'var(--primary-soft)' :
                                                            isPsychology ? '#f5f3ff' :
                                                                isDentist ? '#ecfdf5' : '#fff7ed';

                                                        return (
                                                            <div
                                                                key={item.id}
                                                                style={{
                                                                    background: 'white',
                                                                    borderRadius: '16px',
                                                                    border: '1px solid var(--border)',
                                                                    boxShadow: 'var(--shadow-sm)',
                                                                    padding: '20px',
                                                                    position: 'relative',
                                                                    overflow: 'hidden',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    justifyContent: 'space-between',
                                                                    minHeight: '220px',
                                                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                                                }}
                                                                className="prescription-card"
                                                            >
                                                                {/* Color Top Border */}
                                                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: themeColor }} />

                                                                <div>
                                                                    {/* Card Header */}
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                                                        <span style={{
                                                                            background: themeBgSoft,
                                                                            color: themeColor,
                                                                            fontSize: '10px',
                                                                            fontWeight: 'bold',
                                                                            padding: '4px 10px',
                                                                            borderRadius: '20px',
                                                                            textTransform: 'uppercase',
                                                                            letterSpacing: '0.5px'
                                                                        }}>
                                                                            {item.areaName}
                                                                        </span>
                                                                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                                                            {formatSpanishDate(item.fecha)}
                                                                        </span>
                                                                    </div>

                                                                    {/* Doctor Title */}
                                                                    <div style={{ marginBottom: '16px', borderBottom: '1px dashed var(--border)', paddingBottom: '10px' }}>
                                                                        <small style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '9px', textTransform: 'uppercase' }}>Profesional a cargo</small>
                                                                        <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{item.doctorName}</strong>
                                                                    </div>

                                                                    {/* Prescription (Rx) */}
                                                                    {item.receta?.trim() && (
                                                                        <div style={{ background: '#fcf8f8', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #dc2626', marginBottom: '14px' }}>
                                                                            <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '4px', fontFamily: 'Georgia, serif' }}>Rx</span>
                                                                            <p style={{ margin: 0, fontSize: '12px', color: '#1e293b', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: '1.4' }}>
                                                                                {item.receta}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    {/* Indications / Recommendations */}
                                                                    <div style={{ marginBottom: '16px' }}>
                                                                        <small style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '9px', textTransform: 'uppercase' }}>Indicaciones y Recomendaciones</small>
                                                                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                                                            {item.indicaciones}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Action Certificate Button */}
                                                                {item.rawRecord.tipo_atencion === 'certificadomedico' && (
                                                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                                                                        <button
                                                                            onClick={() => handlePrintPatientCertificate(item.areaKey, item.rawRecord)}
                                                                            style={{
                                                                                width: '100%',
                                                                                background: 'white',
                                                                                border: '1px solid var(--accent)',
                                                                                color: 'var(--accent)',
                                                                                borderRadius: '8px',
                                                                                padding: '8px 12px',
                                                                                fontSize: '11px',
                                                                                fontWeight: 'bold',
                                                                                cursor: 'pointer',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                gap: '6px',
                                                                                transition: 'background 0.2s'
                                                                            }}
                                                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-soft)'; }}
                                                                            onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                                                                        >
                                                                            <FileText size={14} /> Descargar Certificado Médico
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* PAGINATION CONTROLS */}
                                                {totalPages > 1 && (
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        marginTop: '32px',
                                                        borderTop: '1px solid var(--border)',
                                                        paddingTop: '20px'
                                                    }}>
                                                        <button
                                                            onClick={() => setRecetarioPage(prev => Math.max(prev - 1, 1))}
                                                            disabled={recetarioPage === 1}
                                                            className="action-button action-button--light"
                                                            style={{
                                                                minHeight: '36px',
                                                                height: '36px',
                                                                padding: '0 12px',
                                                                fontSize: '11px',
                                                                fontWeight: 'bold',
                                                                opacity: recetarioPage === 1 ? 0.5 : 1,
                                                                cursor: recetarioPage === 1 ? 'not-allowed' : 'pointer'
                                                            }}
                                                        >
                                                            <ChevronLeft size={16} /> Anterior
                                                        </button>

                                                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                                            Página <strong style={{ color: 'var(--primary)' }}>{recetarioPage}</strong> de {totalPages}
                                                        </span>

                                                        <button
                                                            onClick={() => setRecetarioPage(prev => Math.min(prev + 1, totalPages))}
                                                            disabled={recetarioPage === totalPages}
                                                            className="action-button action-button--light"
                                                            style={{
                                                                minHeight: '36px',
                                                                height: '36px',
                                                                padding: '0 12px',
                                                                fontSize: '11px',
                                                                fontWeight: 'bold',
                                                                opacity: recetarioPage === totalPages ? 0.5 : 1,
                                                                cursor: recetarioPage === totalPages ? 'not-allowed' : 'pointer'
                                                            }}
                                                        >
                                                            Siguiente <ChevronRight size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ background: '#f8fafc', padding: '40px 20px', borderRadius: '16px', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                <ClipboardList size={36} style={{ margin: '0 auto 12px', opacity: 0.4, color: 'var(--primary)' }} />
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--primary)', fontWeight: 'bold' }}>No se encontraron registros</h4>
                                                <p style={{ margin: 0, fontSize: '12px' }}>
                                                    {recetarioFilter === 'Todos'
                                                        ? 'Aún no se registran recetas o indicaciones en tu historial de consultas.'
                                                        : `No se registran recetas o indicaciones para el área de ${recetarioFilter}.`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SCENARIO D: FICHA SOCIOECONOMICA */}
                                {activeTab === 'socioeconomica' && isProfileComplete() && (
                                    <div className="nurse-card span-12" style={{ padding: '28px', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                                            <div>
                                                <h2 style={{ fontSize: '18px', color: 'var(--primary)', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Coins size={22} color="var(--accent)" /> Ficha Socioeconómica
                                                </h2>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '4px 0 0' }}>Registra y actualiza tu información socioeconómica de bienestar estudiantil.</p>
                                            </div>
                                            <button
                                                className="action-button action-button--light"
                                                onClick={() => setActiveTab('portal')}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', minHeight: 'auto', height: '36px' }}
                                            >
                                                <ChevronLeft size={16} /> Volver al Portal
                                            </button>
                                        </div>

                                        {socioeconomicMessage && (
                                            <div style={{
                                                padding: '12px 16px',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                marginBottom: '20px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                background: socioeconomicMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
                                                border: `1px solid ${socioeconomicMessage.type === 'success' ? '#10b981' : '#ef4444'}`,
                                                color: socioeconomicMessage.type === 'success' ? '#065f46' : '#991b1b'
                                            }}>
                                                {socioeconomicMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                                <span>{socioeconomicMessage.text}</span>
                                            </div>
                                        )}

                                        <form onSubmit={handleSaveSocioeconomic} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            {/* SECTION 1: ESTRUCTURA FAMILIAR */}
                                            <div>
                                                <h3 style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '14px', borderLeft: '3px solid var(--accent)', paddingLeft: '8px' }}>
                                                    1. Estructura y Composición Familiar
                                                </h3>
                                                <div className="socioeconomic-grid">
                                                    <div className="field">
                                                        <span>Nivel de instrucción del Jefe de Hogar</span>
                                                        <select
                                                            value={socioeconomicForm.nivel_instruccion_jefe_hogar}
                                                            onChange={e => setSocioeconomicForm({ ...socioeconomicForm, nivel_instruccion_jefe_hogar: e.target.value })}
                                                            style={{ width: '100%', border: '1px solid var(--border)' }}
                                                        >
                                                            <option value="">Seleccione nivel</option>
                                                            <option value="Ninguno">Ninguno</option>
                                                            <option value="Primaria">Educación Primaria</option>
                                                            <option value="Secundaria">Educación Secundaria / Bachillerato</option>
                                                            <option value="Superior">Educación Superior / Universitaria</option>
                                                        </select>
                                                    </div>

                                                    <div className="field">
                                                        <span>Ocupación / Empleo del Jefe de Hogar</span>
                                                        <select
                                                            value={socioeconomicForm.empleo_jefe_hogar}
                                                            onChange={e => setSocioeconomicForm({ ...socioeconomicForm, empleo_jefe_hogar: e.target.value })}
                                                            style={{ width: '100%', border: '1px solid var(--border)' }}
                                                        >
                                                            <option value="">Seleccione ocupación</option>
                                                            <option value="Empleado Público">Empleado Público</option>
                                                            <option value="Empleado Privado">Empleado Privado</option>
                                                            <option value="Independiente">Trabajador Independiente / Negocio Propio</option>
                                                            <option value="Desempleado">Desempleado / Quehaceres Domésticos</option>
                                                            <option value="Jubilado">Jubilado / Pensionista</option>
                                                        </select>
                                                    </div>

                                                    <div className="field">
                                                        <span>Ingresos Mensuales del Hogar</span>
                                                        <select
                                                            value={socioeconomicForm.ingresos_mensuales}
                                                            onChange={e => setSocioeconomicForm({ ...socioeconomicForm, ingresos_mensuales: e.target.value })}
                                                            style={{ width: '100%', border: '1px solid var(--border)' }}
                                                        >
                                                            <option value="">Seleccione rango de ingresos</option>
                                                            <option value="Menos de 1 SBU (Menos de $460)">Menos de 1 SBU (Menos de $460)</option>
                                                            <option value="Entre 1 y 2 SBUs ($460 - $920)">Entre 1 y 2 SBUs ($460 - $920)</option>
                                                            <option value="Entre 2 y 3 SBUs ($920 - $1380)">Entre 2 y 3 SBUs ($920 - $1380)</option>
                                                            <option value="Más de 3 SBUs (Más de $1380)">Más de 3 SBUs (Más de $1380)</option>
                                                        </select>
                                                    </div>

                                                    <div className="field">
                                                        <span>Número de personas en el hogar</span>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            placeholder="Ej. 4"
                                                            value={socioeconomicForm.numero_personas_hogar}
                                                            onChange={e => setSocioeconomicForm({ ...socioeconomicForm, numero_personas_hogar: e.target.value })}
                                                            style={{ border: '1px solid var(--border)' }}
                                                        />
                                                    </div>

                                                    <div className="field">
                                                        <span>Aportantes económicos en el hogar</span>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            placeholder="Ej. 2"
                                                            value={socioeconomicForm.numero_aportantes}
                                                            onChange={e => setSocioeconomicForm({ ...socioeconomicForm, numero_aportantes: e.target.value })}
                                                            style={{ border: '1px solid var(--border)' }}
                                                        />
                                                    </div>

                                                    <div className="field">
                                                        <span>Tipo de vivienda</span>
                                                        <select
                                                            value={socioeconomicForm.tipo_vivienda}
                                                            onChange={e => setSocioeconomicForm({ ...socioeconomicForm, tipo_vivienda: e.target.value })}
                                                            style={{ width: '100%', border: '1px solid var(--border)' }}
                                                        >
                                                            <option value="">Seleccione tipo</option>
                                                            <option value="Propia">Propia (Pagada o Financiándose)</option>
                                                            <option value="Arrendada">Arrendada / Alquilada</option>
                                                            <option value="Prestada">Prestada por Familiares</option>
                                                            <option value="Compartida">Compartida / De Alojamiento</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* SECTION 2: TECNOLOGIA E INDICADORES VULNERABILIDAD */}
                                            <div>
                                                <h3 style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '14px', borderLeft: '3px solid var(--accent)', paddingLeft: '8px' }}>
                                                    2. Indicadores Tecnológicos y de Apoyo Social
                                                </h3>
                                                <div className="socioeconomic-grid" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: '500' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={socioeconomicForm.posee_internet}
                                                            onChange={e => setSocioeconomicForm({ ...socioeconomicForm, posee_internet: e.target.checked })}
                                                            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                                                        />
                                                        Tiene Acceso a Internet en el Hogar
                                                    </label>

                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: '500' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={socioeconomicForm.posee_computadora}
                                                            onChange={e => setSocioeconomicForm({ ...socioeconomicForm, posee_computadora: e.target.checked })}
                                                            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                                                        />
                                                        Posee Computadora / Computadora Portátil
                                                    </label>

                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: '500' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={socioeconomicForm.recibe_beca}
                                                            onChange={e => setSocioeconomicForm({ ...socioeconomicForm, recibe_beca: e.target.checked })}
                                                            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                                                        />
                                                        Recibe Beca / Ayuda Financiera Universitaria
                                                    </label>
                                                </div>
                                            </div>

                                            {/* SUBMIT BUTTON */}
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '10px' }}>
                                                <button
                                                    type="submit"
                                                    className="btn"
                                                    disabled={savingSocioeconomic}
                                                    style={{
                                                        background: 'linear-gradient(to right, var(--primary), var(--primary-light))',
                                                        color: 'white',
                                                        padding: '12px 28px',
                                                        fontSize: '12.5px',
                                                        fontWeight: 'bold',
                                                        borderRadius: '10px',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        boxShadow: 'var(--shadow-sm)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    {savingSocioeconomic ? 'Guardando...' : 'Guardar Información'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* SCENARIO E: CITAS MEDICAS */}
                                {activeTab === 'citas' && isProfileComplete() && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', width: '100%' }}>
                                        {/* FORM TO BOOK */}
                                        <div className="nurse-card span-5" style={{ padding: '24px', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <h2 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                                <Calendar size={18} color="var(--primary)" /> Nueva Cita Médica
                                            </h2>

                                            {errorCita && (
                                                <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fee2e2', padding: '12px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <AlertCircle size={14} /> {errorCita}
                                                </div>
                                            )}
                                            {successCita && (
                                                <div style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #dcfce7', padding: '12px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <CheckCircle2 size={14} /> {successCita}
                                                </div>
                                            )}

                                            <form onSubmit={handleAgendarCita} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                                <div className="premium-field-card">
                                                    <div className="field-header">
                                                        <div className="field-header__left">
                                                            <span className="field-header__icon"><Stethoscope size={15} /></span>
                                                            <h4 className="field-header__title">Especialidad Requerida <span className="field-req-star">*</span></h4>
                                                        </div>
                                                    </div>
                                                    <select
                                                        value={selectedRolDoctor}
                                                        onChange={(e) => setSelectedRolDoctor(e.target.value)}
                                                        style={{ width: '100%' }}
                                                    >
                                                        <option value="medico_general">Medicina General</option>
                                                        <option value="psicologo">Psicología Clínica</option>
                                                        <option value="odontologo">Odontología</option>
                                                        <option value="medico_ocupacional">Médico Ocupacional</option>
                                                    </select>
                                                </div>

                                                {ocupacionalAccessDenied ? (
                                                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', color: '#b45309', padding: '12px', borderRadius: '12px', fontSize: '11px', lineHeight: '1.4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <AlertTriangle size={16} flexShrink={0} />
                                                        <div>
                                                            <strong>Acceso Restringido:</strong> Solo personal docente o acogido al Código de Trabajo tiene permitido agendar consultas con Medicina Ocupacional.
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><UserCheck size={15} /></span>
                                                                    <h4 className="field-header__title">Profesional Especialista <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <select
                                                                value={selectedDoctorId}
                                                                onChange={(e) => setSelectedDoctorId(e.target.value)}
                                                                required
                                                                style={{ width: '100%' }}
                                                            >
                                                                <option value="">-- Elija un especialista --</option>
                                                                {((doctoresDisponibles || []).filter(doc =>
                                                                    doc.roles && doc.roles.some(r => r.name === selectedRolDoctor)
                                                                )).map(doc => (
                                                                    <option key={doc.id} value={doc.id}>
                                                                        {doc.datos_identificacion?.primer_nombre ? `${doc.datos_identificacion.primer_nombre} ${doc.datos_identificacion.apellido_paterno || ''}`.trim() : doc.name} ({doc.cargo_medico?.nombre || 'Especialista'})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><Calendar size={15} /></span>
                                                                    <h4 className="field-header__title">Fecha de la Cita <span className="field-req-star">*</span></h4>
                                                                </div>
                                                            </div>
                                                            <input
                                                                type="date"
                                                                value={selectedDate}
                                                                min={getTodayLocalDateStr()}
                                                                onChange={(e) => {
                                                                    const date = new Date(e.target.value);
                                                                    const day = date.getUTCDay();
                                                                    if (day === 0 || day === 6) {
                                                                        setAlertModal({
                                                                            show: true,
                                                                            title: 'Día No Laborable',
                                                                            message: 'La universidad no brinda atención médica los fines de semana. Por favor, selecciona una fecha de lunes a viernes.',
                                                                            type: 'warning'
                                                                        });
                                                                        setSelectedDate('');
                                                                    } else {
                                                                        setSelectedDate(e.target.value);
                                                                    }
                                                                }}
                                                                required
                                                                style={{ width: '100%' }}
                                                            />
                                                        </div>

                                                        {selectedDoctorId && selectedDate && (
                                                            <div className="premium-field-card">
                                                                <div className="field-header">
                                                                    <div className="field-header__left">
                                                                        <span className="field-header__icon"><Clock size={15} /></span>
                                                                        <h4 className="field-header__title">Horarios Disponibles <span className="field-req-star">*</span></h4>
                                                                    </div>
                                                                </div>
                                                                {slotsLoading ? (
                                                                    <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>Cargando disponibilidad...</span>
                                                                ) : availableSlots.length === 0 ? (
                                                                    <span style={{ display: 'block', fontSize: '11px', color: '#b91c1c', fontWeight: 'bold' }}>No hay horarios disponibles para esta fecha.</span>
                                                                ) : (
                                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px' }}>
                                                                        {availableSlots.map(slot => {
                                                                            const isPast = selectedDate === getTodayLocalDateStr() && slot <= getCurrentLocalTimeStr();
                                                                            return (
                                                                                <button
                                                                                    key={slot}
                                                                                    type="button"
                                                                                    disabled={isPast}
                                                                                    onClick={() => !isPast && setSelectedSlot(slot)}
                                                                                    style={{
                                                                                        padding: '10px 8px',
                                                                                        borderRadius: '10px',
                                                                                        border: isPast
                                                                                            ? '1px solid #e5e7eb'
                                                                                            : selectedSlot === slot
                                                                                                ? '2px solid var(--primary)'
                                                                                                : '1px solid rgba(0,32,64,0.12)',
                                                                                        background: isPast
                                                                                            ? '#f3f4f6'
                                                                                            : selectedSlot === slot
                                                                                                ? 'var(--primary-soft)'
                                                                                                : '#ffffff',
                                                                                        color: isPast
                                                                                            ? '#9ca3af'
                                                                                            : selectedSlot === slot
                                                                                                ? 'var(--primary)'
                                                                                                : 'var(--text)',
                                                                                        fontWeight: selectedSlot === slot ? 'bold' : '600',
                                                                                        fontSize: '12px',
                                                                                        cursor: isPast ? 'not-allowed' : 'pointer',
                                                                                        textAlign: 'center',
                                                                                        transition: 'all 0.2s ease',
                                                                                        boxShadow: selectedSlot === slot ? '0 3px 10px rgba(0,32,64,0.1)' : 'none',
                                                                                        opacity: isPast ? 0.55 : 1
                                                                                    }}
                                                                                    title={isPast ? 'Este horario ya transcurrió' : `Seleccionar horario ${slot}`}
                                                                                >
                                                                                    {slot}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="premium-field-card">
                                                            <div className="field-header">
                                                                <div className="field-header__left">
                                                                    <span className="field-header__icon"><FileText size={15} /></span>
                                                                    <h4 className="field-header__title">Motivo de la Consulta</h4>
                                                                </div>
                                                                <span className="field-badge-opt">Opcional</span>
                                                            </div>
                                                            <textarea
                                                                value={motivoCita}
                                                                onChange={(e) => setMotivoCita(e.target.value)}
                                                                placeholder="Describa brevemente los síntomas o motivo de su cita..."
                                                                rows={3}
                                                                maxLength={500}
                                                                style={{ width: '100%', minHeight: '70px' }}
                                                            />
                                                        </div>

                                                        {selectedSlot && selectedDate && (
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px',
                                                                padding: '10px 14px',
                                                                borderRadius: '12px',
                                                                background: 'rgba(183, 26, 52, 0.05)',
                                                                border: '1px solid rgba(183, 26, 52, 0.15)',
                                                                color: 'var(--primary)',
                                                                fontSize: '12px',
                                                                marginTop: '4px'
                                                            }}>
                                                                <Clock size={16} color="var(--accent)" />
                                                                <div>
                                                                    <span>Horario seleccionado: </span>
                                                                    <strong style={{ color: 'var(--accent)' }}>{selectedDate} a las {selectedSlot}</strong>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <button
                                                            type="submit"
                                                            disabled={savingCita || !selectedSlot}
                                                            className="btn-agendar-cita"
                                                        >
                                                            {savingCita ? (
                                                                <>
                                                                    <Loader2 size={18} className="spin-icon" />
                                                                    <span>Confirmando Cita...</span>
                                                                </>
                                                            ) : !selectedDate ? (
                                                                <>
                                                                    <CalendarCheck size={18} />
                                                                    <span>Seleccione Fecha y Horario</span>
                                                                </>
                                                            ) : !selectedSlot ? (
                                                                <>
                                                                    <Clock size={18} />
                                                                    <span>Seleccione un Horario</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CalendarCheck size={18} />
                                                                    <span>Confirmar Agendamiento</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                            </form>
                                        </div>

                                        {/* SCHEDULE LISTINGS WITH FILTERS AND PAGINATION */}
                                        <div className="nurse-card span-7" style={{ padding: '24px', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                                                <h2 style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Clock size={18} color="var(--primary)" /> Mis Citas Médicas
                                                </h2>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                                                    Total: {filteredCitasList.length} citas
                                                </span>
                                            </div>

                                            {/* FILTERS TOOLBAR */}
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                                                    <Filter size={14} color="var(--primary)" /> Filtrar:
                                                </div>

                                                {/* Specialty Filter */}
                                                <select
                                                    value={citaFilterSpecialty}
                                                    onChange={e => { setCitaFilterSpecialty(e.target.value); setCitaPage(1); }}
                                                    style={{ fontSize: '11.5px', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    <option value="todas">Todas las Especialidades</option>
                                                    <option value="medico_general">Medicina General</option>
                                                    <option value="psicologo">Psicología Clínica</option>
                                                    <option value="odontologo">Odontología</option>
                                                    <option value="medico_ocupacional">Médico Ocupacional</option>
                                                </select>

                                                {/* Month Filter */}
                                                <select
                                                    value={citaFilterMonth}
                                                    onChange={e => { setCitaFilterMonth(e.target.value); setCitaPage(1); }}
                                                    style={{ fontSize: '11.5px', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: '600', cursor: 'pointer' }}
                                                >
                                                    <option value="todos">Todos los Meses</option>
                                                    <option value="01">Enero</option>
                                                    <option value="02">Febrero</option>
                                                    <option value="03">Marzo</option>
                                                    <option value="04">Abril</option>
                                                    <option value="05">Mayo</option>
                                                    <option value="06">Junio</option>
                                                    <option value="07">Julio</option>
                                                    <option value="08">Agosto</option>
                                                    <option value="09">Septiembre</option>
                                                    <option value="10">Octubre</option>
                                                    <option value="11">Noviembre</option>
                                                    <option value="12">Diciembre</option>
                                                </select>

                                                {(citaFilterMonth !== 'todos' || citaFilterSpecialty !== 'todas') && (
                                                    <button
                                                        onClick={() => { setCitaFilterMonth('todos'); setCitaFilterSpecialty('todas'); setCitaPage(1); }}
                                                        style={{ fontSize: '10.5px', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
                                                    >
                                                        Limpiar
                                                    </button>
                                                )}
                                            </div>

                                            {citasLoading ? (
                                                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cargando agenda...</span>
                                                </div>
                                            ) : filteredCitasList.length === 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    <Calendar size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
                                                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold' }}>No se encontraron citas</h4>
                                                    <p style={{ fontSize: '11px', margin: '4px 0 0', maxWidth: '260px' }}>
                                                        {citasList.length === 0
                                                            ? 'No tienes citas médicas en tu historial. Utiliza el formulario de la izquierda para agendar una.'
                                                            : 'No hay citas que coincidan con los filtros seleccionados.'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '300px', paddingRight: '4px' }}>
                                                        {paginatedCitasList.map(cita => {
                                                            const isUpcoming = ['programada', 'confirmada'].includes(cita.estado);
                                                            const statusColors = {
                                                                programada: { bg: '#eff6ff', text: '#1e40af', border: '#dbeafe' },
                                                                confirmada: { bg: '#ecfdf5', text: '#065f46', border: '#d1fae5' },
                                                                completada: { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
                                                                cancelada: { bg: '#fef2f2', text: '#991b1b', border: '#fee2e2' }
                                                            }[cita.estado];

                                                            const specialtyLabels = {
                                                                medico_general: 'Medicina General',
                                                                psicologo: 'Psicología Clínica',
                                                                odontologo: 'Odontología',
                                                                medico_ocupacional: 'Medicina Ocupacional'
                                                            };

                                                            return (
                                                                <div key={cita.id} style={{
                                                                    padding: '16px',
                                                                    borderRadius: '12px',
                                                                    border: `1px solid ${statusColors.border}`,
                                                                    background: statusColors.bg,
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: '10px',
                                                                    transition: 'all 0.15s ease'
                                                                }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                        <div>
                                                                            <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: statusColors.text, background: 'rgba(255,255,255,0.6)', padding: '2px 6px', borderRadius: '4px', border: `1px solid ${statusColors.border}` }}>
                                                                                {specialtyLabels[cita.rol_doctor] || 'Médico'}
                                                                            </span>
                                                                            <h4 style={{ margin: '6px 0 2px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text)' }}>
                                                                                Dr(a). {cita.doctor?.datos_identificacion?.primer_nombre ? `${cita.doctor.datos_identificacion.primer_nombre} ${cita.doctor.datos_identificacion.apellido_paterno || ''}`.trim() : cita.doctor?.name || 'Especialista'}
                                                                            </h4>
                                                                            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {formatSpanishDate(cita.fecha)}</span>
                                                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {cita.hora_inicio} - {cita.hora_fin}</span>
                                                                                {cita.confirmada_por_paciente && (
                                                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 'bold' }}>
                                                                                        <CheckCircle2 size={12} /> Asistencia Confirmada
                                                                                    </span>
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                        <span style={{
                                                                            fontSize: '9.5px',
                                                                            fontWeight: 'bold',
                                                                            textTransform: 'uppercase',
                                                                            color: statusColors.text,
                                                                            padding: '3px 8px',
                                                                            borderRadius: '10px',
                                                                            background: 'white',
                                                                            border: `1px solid ${statusColors.border}`
                                                                        }}>
                                                                            {cita.estado}
                                                                        </span>
                                                                    </div>

                                                                    {cita.motivo && (
                                                                        <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.4)', padding: '8px 12px', borderRadius: '6px' }}>
                                                                            <strong>Motivo:</strong> {cita.motivo}
                                                                        </p>
                                                                    )}

                                                                    {cita.notas_doctor && (
                                                                        <p style={{ margin: 0, fontSize: '11.5px', color: '#374151', background: '#fffbeb', border: '1px solid #fef3c7', padding: '8px 12px', borderRadius: '6px' }}>
                                                                            <strong>Notas del Especialista:</strong> {cita.notas_doctor}
                                                                        </p>
                                                                    )}

                                                                    {isUpcoming && (
                                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '4px' }}>
                                                                            {!cita.confirmada_por_paciente && (
                                                                                <button
                                                                                    onClick={() => handleConfirmarAsistencia(cita.id)}
                                                                                    style={{
                                                                                        background: 'var(--primary)',
                                                                                        color: 'white',
                                                                                        border: 0,
                                                                                        fontSize: '11px',
                                                                                        fontWeight: 'bold',
                                                                                        cursor: 'pointer',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        gap: '4px',
                                                                                        padding: '6px 12px',
                                                                                        borderRadius: '8px',
                                                                                        marginRight: '8px',
                                                                                        transition: 'all 0.15s ease'
                                                                                    }}
                                                                                    onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                                                                                    onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
                                                                                >
                                                                                    <CheckCircle2 size={13} /> Confirmar Asistencia
                                                                                </button>
                                                                            )}
                                                                            <button
                                                                                onClick={() => handleCancelarCita(cita.id)}
                                                                                style={{
                                                                                    background: 'none',
                                                                                    border: 0,
                                                                                    color: '#b91c1c',
                                                                                    fontSize: '11px',
                                                                                    fontWeight: 'bold',
                                                                                    cursor: 'pointer',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '4px',
                                                                                    padding: '6px 10px',
                                                                                    borderRadius: '6px',
                                                                                    transition: 'all 0.1s ease'
                                                                                }}
                                                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(185, 28, 28, 0.08)'}
                                                                                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                                                            >
                                                                                <Trash2 size={13} /> Cancelar Cita
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* PAGINATION FOOTER */}
                                                    {totalCitaPages > 1 && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                                                            <button
                                                                onClick={() => setCitaPage(prev => Math.max(prev - 1, 1))}
                                                                disabled={citaPage === 1}
                                                                style={{
                                                                    fontSize: '11px',
                                                                    fontWeight: 'bold',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid var(--border)',
                                                                    background: citaPage === 1 ? '#f1f5f9' : 'white',
                                                                    color: citaPage === 1 ? 'var(--text-muted)' : 'var(--primary)',
                                                                    cursor: citaPage === 1 ? 'not-allowed' : 'pointer'
                                                                }}
                                                            >
                                                                ← Anterior
                                                            </button>

                                                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                                                                Página {citaPage} de {totalCitaPages}
                                                            </span>

                                                            <button
                                                                onClick={() => setCitaPage(prev => Math.min(prev + 1, totalCitaPages))}
                                                                disabled={citaPage === totalCitaPages}
                                                                style={{
                                                                    fontSize: '11px',
                                                                    fontWeight: 'bold',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid var(--border)',
                                                                    background: citaPage === totalCitaPages ? '#f1f5f9' : 'white',
                                                                    color: citaPage === totalCitaPages ? 'var(--text-muted)' : 'var(--primary)',
                                                                    cursor: citaPage === totalCitaPages ? 'not-allowed' : 'pointer'
                                                                }}
                                                            >
                                                                Siguiente →
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
                {/* MODAL: NO CERTIFICATE AVAILABLE */}
                {noCertificateModal.show && (
                    <div className="clinical-modal show" style={{ zIndex: 9999 }}>
                        <div className="clinical-modal__backdrop" onClick={() => setNoCertificateModal({ show: false, message: '' })}></div>
                        <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '440px', borderRadius: '16px', overflow: 'hidden' }}>
                            <header className="clinical-modal__header" style={{ background: '#e11d48', color: '#fff', padding: '16px 20px' }}>
                                <div className="clinical-modal__patient" style={{ gap: '10px' }}>
                                    <span className="clinical-modal__avatar" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <AlertCircle size={18} />
                                    </span>
                                    <div>
                                        <h2 style={{ fontSize: '15px', color: '#fff', margin: 0 }}>Certificado No Disponible</h2>
                                    </div>
                                </div>
                                <button className="clinical-modal__close" onClick={() => setNoCertificateModal({ show: false, message: '' })} style={{ color: '#fff' }}><X size={15} /></button>
                            </header>
                            <div className="clinical-modal__body" style={{ padding: '24px 20px', textAlign: 'center' }}>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 20px' }}>
                                    {noCertificateModal.message}
                                </p>
                                <button
                                    className="action-button"
                                    onClick={() => setNoCertificateModal({ show: false, message: '' })}
                                    style={{ width: '100%', minHeight: '40px', borderRadius: '10px', background: '#e11d48', border: 0, color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: VIEW DETAILS OF CONSULTATION */}
                {viewDetailsModal.show && viewDetailsModal.record && (
                    <div className="clinical-modal show" style={{ zIndex: 9990 }}>
                        <div className="clinical-modal__backdrop" onClick={() => setViewDetailsModal({ show: false, record: null, area: '' })}></div>
                        <div className="clinical-modal__dialog" style={{ width: '90vw', maxWidth: '600px', borderRadius: '16px', overflow: 'hidden' }}>
                            <header className="clinical-modal__header" style={{ background: 'var(--primary)', color: '#fff', padding: '18px 20px' }}>
                                <div className="clinical-modal__patient" style={{ gap: '10px' }}>
                                    <div className="clinical-modal__avatar" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Detalles de Atención - {viewDetailsModal.area === 'medicina' ? 'Medicina General' :
                                                viewDetailsModal.area === 'psicologia' ? 'Psicología Clínica' :
                                                    viewDetailsModal.area === 'odontologia' ? 'Odontología' : 'Enfermería'}
                                        </span>
                                        <h2 style={{ fontSize: '16px', color: '#fff', margin: '2px 0 0' }}>{viewDetailsModal.record.recordTitle}</h2>
                                    </div>
                                </div>
                                <button className="clinical-modal__close" onClick={() => setViewDetailsModal({ show: false, record: null, area: '' })} style={{ color: '#fff' }}><X size={16} /></button>
                            </header>
                            <div className="clinical-modal__body" style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        <strong>Fecha de registro:</strong> {(viewDetailsModal.record.fecha || viewDetailsModal.record.created_at || '').slice(0, 10)}
                                    </span>
                                    <span style={{ fontSize: '11px', background: 'var(--primary-soft)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                                        {viewDetailsModal.record.type}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                    {/* MEDICINA DETAILS */}
                                    {viewDetailsModal.area === 'medicina' && (
                                        <>
                                            {viewDetailsModal.record.type === 'evolucion' && (
                                                <>
                                                    <div className="preview-paper-field">
                                                        <span>Evolución Médica</span>
                                                        <p style={{ fontStyle: 'italic', background: '#eef2f6', padding: '12px', borderRadius: '8px', border: '1px solid #cfdbe6', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                                                            {viewDetailsModal.record.detalle_evolucion}
                                                        </p>
                                                    </div>
                                                    <div className="preview-paper-field">
                                                        <span>Prescripción / Indicación</span>
                                                        <p style={{ background: '#f5fbf7', padding: '12px', borderRadius: '8px', border: '1px solid #d3ebd8', color: 'var(--success)', fontSize: '12px', margin: 0 }}>
                                                            {viewDetailsModal.record.prescripcion_medica || 'Sin prescripción.'}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                            {viewDetailsModal.record.type === 'diario' && (
                                                <>
                                                    <div className="preview-paper-field">
                                                        <span>Sintomatología Declarada</span>
                                                        <p style={{ fontSize: '12.5px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', margin: 0 }}>
                                                            {viewDetailsModal.record.detalle_diagnostico || 'Atención general'}
                                                        </p>
                                                    </div>
                                                    <div className="preview-paper-field">
                                                        <span>Tipo de Atención</span>
                                                        <strong style={{ fontSize: '12px', textTransform: 'capitalize' }}>{viewDetailsModal.record.tipo_atencion}</strong>
                                                    </div>
                                                </>
                                            )}
                                            {viewDetailsModal.record.type === 'signos' && (
                                                <div className="preview-vitals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                    <div>
                                                        <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>P. Arterial</span>
                                                        <strong style={{ fontSize: '13px' }}>{viewDetailsModal.record.presion_arterial_sistolica || '—'}/{viewDetailsModal.record.presion_arterial_diastolica || '—'} mmHg</strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>F. Cardiaca</span>
                                                        <strong style={{ fontSize: '13px' }}>{viewDetailsModal.record.frecuencia_cardiaca || '—'} lpm</strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>Temperatura</span>
                                                        <strong style={{ fontSize: '13px' }}>{viewDetailsModal.record.temperatura || '—'} °C</strong>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* PSICOLOGIA DETAILS */}
                                    {viewDetailsModal.area === 'psicologia' && (
                                        <>
                                            {viewDetailsModal.record.type === 'evolucion' && (
                                                <>
                                                    <div className="preview-paper-field">
                                                        <span>Detalle de Sesión Psicológica</span>
                                                        <p style={{ fontStyle: 'italic', background: '#f5f3ff', padding: '12px', borderRadius: '8px', border: '1px solid #ddd6fe', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                                                            {viewDetailsModal.record.detalle_evolucion}
                                                        </p>
                                                    </div>
                                                    <div className="preview-paper-field">
                                                        <span>Recomendaciones</span>
                                                        <p style={{ background: '#f0fdfa', padding: '12px', borderRadius: '8px', border: '1px solid #99f6e4', color: '#0f766e', fontSize: '12px', margin: 0 }}>
                                                            {viewDetailsModal.record.prescripcion_medica || 'Sin recomendaciones.'}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                            {viewDetailsModal.record.type === 'diario' && (
                                                <>
                                                    <div className="preview-paper-field">
                                                        <span>Tipo de Consulta</span>
                                                        <strong style={{ fontSize: '12.5px', textTransform: 'capitalize', display: 'block', background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>{viewDetailsModal.record.tipo_atencion}</strong>
                                                    </div>
                                                    <div className="preview-paper-field">
                                                        <span>Diagnóstico</span>
                                                        <p style={{ fontSize: '12.5px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', margin: 0 }}>{viewDetailsModal.record.detalle_diagnostico}</p>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}

                                    {/* ODONTOLOGIA DETAILS */}
                                    {viewDetailsModal.area === 'odontologia' && (
                                        <>
                                            {viewDetailsModal.record.type === 'evolucion' && (
                                                <div style={{ marginTop: '10px' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                                                        <thead>
                                                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                                                                <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>Tratamiento Realizado / Evolución</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td style={{ padding: '12px 10px', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: '1.5' }}>
                                                                    {viewDetailsModal.record.detalle_evolucion}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                            {viewDetailsModal.record.type === 'diario' && (
                                                <div style={{ marginTop: '10px' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                                                        <thead>
                                                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                                                                <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)', width: '50%' }}>Motivo Odontológico</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>Procedimiento Realizado</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{viewDetailsModal.record.diagnostico || 'Consulta dental'}</td>
                                                                <td style={{ padding: '12px 10px', fontWeight: 'bold', color: 'var(--accent)' }}>{viewDetailsModal.record.procedimiento || 'General'}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* ENFERMERIA DETAILS */}
                                    {viewDetailsModal.area === 'enfermeria' && (
                                        <>
                                            {viewDetailsModal.record.type === 'vitals' && (
                                                <div className="preview-vitals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                                    <div>
                                                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>Presión Arterial</span>
                                                        <strong style={{ fontSize: '14px' }}>{viewDetailsModal.record.presion_arterial_sistolica || '—'}/{viewDetailsModal.record.presion_arterial_diastolica || '—'} mmHg</strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>Frec. Cardíaca</span>
                                                        <strong style={{ fontSize: '14px' }}>{viewDetailsModal.record.frecuencia_cardiaca || '—'} lpm</strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>Frec. Respiratoria</span>
                                                        <strong style={{ fontSize: '14px' }}>{viewDetailsModal.record.frecuencia_respiratoria || '—'} rpm</strong>
                                                    </div>
                                                    <div style={{ marginTop: '10px' }}>
                                                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>Temperatura</span>
                                                        <strong style={{ fontSize: '14px' }}>{viewDetailsModal.record.temperatura || '—'} °C</strong>
                                                    </div>
                                                    <div style={{ marginTop: '10px' }}>
                                                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>Talla (Estatura)</span>
                                                        <strong style={{ fontSize: '14px' }}>{viewDetailsModal.record.talla || '—'} cm</strong>
                                                    </div>
                                                    <div style={{ marginTop: '10px' }}>
                                                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>Peso Corporal</span>
                                                        <strong style={{ fontSize: '14px' }}>{viewDetailsModal.record.peso || '—'} kg</strong>
                                                    </div>
                                                </div>
                                            )}
                                            {viewDetailsModal.record.type === 'diario' && (
                                                <div style={{ marginTop: '10px' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                                                        <thead>
                                                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                                                                <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)', width: '45%' }}>Procedimiento de Enfermería</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}>Detalles y Observaciones</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td style={{ padding: '12px 10px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{viewDetailsModal.record.procedimiento?.nombre_procedimiento || 'Cura / Inyección'}</td>
                                                                <td style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.5' }}>
                                                                    {viewDetailsModal.record.detalle_procedimiento || 'Sin observaciones.'}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                    <button
                                        className="action-button action-button--primary"
                                        onClick={() => setViewDetailsModal({ show: false, record: null, area: '' })}
                                        style={{ padding: '8px 24px', fontSize: '12.5px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        Cerrar Detalles
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL DE VISTA DE FICHA SOCIOECONÓMICA / PERFIL */}
                {isViewFichaOpen && profile && (
                    <div className="clinical-modal show" style={{ zIndex: 4000 }}>
                        <div className="clinical-modal__backdrop" onClick={() => setIsViewFichaOpen(false)}></div>
                        <div className="clinical-modal__dialog" style={{ maxWidth: '850px', width: '90vw' }}>
                            <header className="clinical-modal__header" style={{ background: 'var(--primary)', color: 'white' }}>
                                <div className="clinical-modal__patient">
                                    {getPhotoUrl() ? (
                                        <img
                                            src={getPhotoUrl()}
                                            alt=""
                                            onError={() => setPhotoError(true)}
                                            style={{
                                                width: '46px',
                                                height: '46px',
                                                borderRadius: '12px',
                                                objectFit: 'cover',
                                                border: '2px solid rgba(255,255,255,0.4)',
                                                marginRight: '12px'
                                            }}
                                        />
                                    ) : (
                                        <span className="clinical-modal__avatar" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', marginRight: '12px' }}>
                                            <User size={20} />
                                        </span>
                                    )}
                                    <div>
                                        <span>Resumen del Registro</span>
                                        <h2 style={{ color: 'white', margin: 0 }}>Ficha Médica & Demográfica</h2>
                                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', margin: '2px 0 0' }}>
                                            {profile?.identification?.primer_nombre} {profile?.identification?.segundo_nombre || ''} {profile?.identification?.apellido_paterno} {profile?.identification?.apellido_materno || ''}
                                        </p>
                                    </div>
                                </div>
                                <button className="clinical-modal__close" onClick={() => setIsViewFichaOpen(false)} style={{ color: 'white' }}><X size={16} /></button>
                            </header>

                            <div className="clinical-modal__body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                                {/* SECCIÓN 1: DATOS PERSONALES */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '13px', color: 'var(--primary)', borderBottom: '2px solid var(--primary-soft)', paddingBottom: '6px', margin: '0 0 14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Datos Personales de Identificación
                                    </h3>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                        {getPhotoUrl() ? (
                                            <div style={{ flexShrink: 0, marginBottom: '10px' }}>
                                                <img
                                                    src={getPhotoUrl()}
                                                    alt=""
                                                    onError={() => setPhotoError(true)}
                                                    style={{
                                                        width: '110px',
                                                        height: '130px',
                                                        borderRadius: '12px',
                                                        objectFit: 'cover',
                                                        border: '1px solid var(--border)',
                                                        boxShadow: 'var(--shadow-sm)'
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div style={{ flexShrink: 0, marginBottom: '10px' }}>
                                                <div style={{
                                                    width: '110px',
                                                    height: '130px',
                                                    borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, var(--primary-soft), #f1f5f9)',
                                                    border: '1px dashed var(--border)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    color: 'var(--text-muted)'
                                                }}>
                                                    <User size={32} />
                                                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Sin Foto</span>
                                                </div>
                                            </div>
                                        )}
                                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                                            <div>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Cédula / Pasaporte</small>
                                                <strong style={{ fontSize: '12.5px' }}>{profile?.identification?.numero_cedula || '—'}</strong>
                                            </div>
                                            <div>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Nombres Completos</small>
                                                <strong style={{ fontSize: '12.5px' }}>
                                                    {profile?.identification?.primer_nombre} {profile?.identification?.segundo_nombre || ''}
                                                </strong>
                                            </div>
                                            <div>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Apellidos Completos</small>
                                                <strong style={{ fontSize: '12.5px' }}>
                                                    {profile?.identification?.apellido_paterno} {profile?.identification?.apellido_materno || ''}
                                                </strong>
                                            </div>
                                            <div>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Fecha de Nacimiento</small>
                                                <strong style={{ fontSize: '12.5px' }}>{profile?.identification?.fecha_nacimiento || '—'}</strong>
                                            </div>
                                            <div>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Género</small>
                                                <strong style={{ fontSize: '12.5px', textTransform: 'capitalize' }}>{profile?.demographic?.genero?.nombre || '—'}</strong>
                                            </div>
                                            <div>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Estado Civil</small>
                                                <strong style={{ fontSize: '12.5px', textTransform: 'capitalize' }}>{profile?.demographic?.estado_civil?.nombres || profile?.demographic?.estadoCivil?.nombres || '—'}</strong>
                                            </div>
                                            <div>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Nacionalidad</small>
                                                <strong style={{ fontSize: '12.5px' }}>
                                                    {profile?.identification?.es_extranjero ? `Extranjero (${profile?.identification?.nacionalidad || '—'})` : 'Ecuatoriana'}
                                                </strong>
                                            </div>
                                            <div>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Tipo de Sangre</small>
                                                <strong style={{ fontSize: '12.5px', color: profile?.blood_type?.nombre ? 'var(--accent)' : 'inherit' }}>
                                                    {profile?.blood_type?.nombre || 'No asignado'}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECCIÓN 2: INFORMACIÓN ACADÉMICA / LABORAL */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '13px', color: 'var(--primary)', borderBottom: '2px solid var(--primary-soft)', paddingBottom: '6px', margin: '0 0 14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Información Institucional
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                        <div>
                                            <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Tipo de Usuario</small>
                                            <strong style={{ fontSize: '12.5px' }}>{profile?.career_study?.tipo_usuario?.nombre || 'Estudiante'}</strong>
                                        </div>
                                        {profile?.career_study?.facultad && (
                                            <div>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Facultad</small>
                                                <strong style={{ fontSize: '12.5px' }}>{profile?.career_study?.facultad?.nombre || '—'}</strong>
                                            </div>
                                        )}
                                        {profile?.career_study?.carrera && (
                                            <div>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Carrera</small>
                                                <strong style={{ fontSize: '12.5px' }}>{profile?.career_study?.carrera?.nombre || '—'}</strong>
                                            </div>
                                        )}
                                        {profile?.career_study?.ciclo && (
                                            <div>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Semestre / Ciclo</small>
                                                <strong style={{ fontSize: '12.5px' }}>{profile?.career_study?.ciclo?.numero || '—'}</strong>
                                            </div>
                                        )}
                                        {profile?.career_study?.paralelo && (
                                            <div>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Paralelo</small>
                                                <strong style={{ fontSize: '12.5px' }}>{profile?.career_study?.paralelo || '—'}</strong>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SECCIÓN 3: DATOS DE CONTACTO */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '13px', color: 'var(--primary)', borderBottom: '2px solid var(--primary-soft)', paddingBottom: '6px', margin: '0 0 14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Información de Contacto
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                        <div>
                                            <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Teléfono Convencional (Fijo)</small>
                                            <strong style={{ fontSize: '12.5px' }}>{profile?.addresses?.[0]?.telefono_convencional || '—'}</strong>
                                        </div>
                                        <div>
                                            <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Correo Institucional</small>
                                            <strong style={{ fontSize: '12.5px' }}>{user?.email || '—'}</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* SECCIÓN 4: CONTACTO DE EMERGENCIA */}
                                {profile?.emergency_contacts && profile.emergency_contacts.length > 0 && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '13px', color: 'var(--primary)', borderBottom: '2px solid var(--primary-soft)', paddingBottom: '6px', margin: '0 0 14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Contacto de Emergencia
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                            <div>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Nombre Completo</small>
                                                <strong style={{ fontSize: '12.5px' }}>{profile.emergency_contacts[0].nombre_completo || '—'}</strong>
                                            </div>
                                            <div>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Parentesco</small>
                                                <strong style={{ fontSize: '12.5px' }}>{profile.emergency_contacts[0].parentesco || '—'}</strong>
                                            </div>
                                            <div>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Teléfono de Contacto</small>
                                                <strong style={{ fontSize: '12.5px' }}>{profile.emergency_contacts[0].telefono || '—'}</strong>
                                            </div>
                                            <div>
                                                <small style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Celular Alterno</small>
                                                <strong style={{ fontSize: '12.5px' }}>{profile.emergency_contacts[0].celular || '—'}</strong>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* SECCIÓN 4: DIRECCIONES */}
                                {profile?.directions && profile.directions.length > 0 && (
                                    <div>
                                        <h3 style={{ fontSize: '13px', color: 'var(--primary)', borderBottom: '2px solid var(--primary-soft)', paddingBottom: '6px', margin: '0 0 14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Ubicación y Direcciones Registradas
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                            {profile.directions.map((dir, idx) => (
                                                <div key={idx} style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                    <span style={{ fontSize: '10.5px', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                                                        Dirección de {dir.id_tipo_direccion === 1 ? 'Procedencia' : 'Residencia'}
                                                    </span>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '12px' }}>
                                                        <div>
                                                            <span style={{ color: 'var(--text-muted)' }}>Provincia:</span> <strong>{dir.provincia?.nombre || '—'}</strong>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: 'var(--text-muted)' }}>Cantón:</span> <strong>{dir.canton?.nombre || '—'}</strong>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: 'var(--text-muted)' }}>Calle Principal:</span> <strong>{dir.calle_principal || '—'}</strong>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: 'var(--text-muted)' }}>Calle Secundaria:</span> <strong>{dir.calle_secundaria || '—'}</strong>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: 'var(--text-muted)' }}>Referencia:</span> <strong>{dir.referencia || '—'}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <footer className="clinical-modal__actions" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    className="action-button action-button--primary"
                                    onClick={handlePrintFicha}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '130px' }}
                                >
                                    <Printer size={15} /> Imprimir Ficha
                                </button>
                                <button className="action-button action-button--light" onClick={() => setIsViewFichaOpen(false)} style={{ minWidth: '120px' }}>
                                    Cerrar Vista
                                </button>
                            </footer>
                        </div>
                    </div>
                )}

                {/* GENERIC CUSTOM CLINICAL ALERT MODAL */}
                {alertModal.show && (
                    <div className="clinical-modal show" style={{ zIndex: 10000 }}>
                        <div className="clinical-modal__backdrop" onClick={() => setAlertModal({ ...alertModal, show: false })} />
                        <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '440px', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                            <header className="clinical-modal__header" style={{
                                background: alertModal.type === 'danger' ? 'linear-gradient(135deg, #dc2626, #991b1b)' :
                                    alertModal.type === 'warning' ? 'linear-gradient(135deg, #d97706, #b45309)' :
                                        alertModal.type === 'success' ? 'linear-gradient(135deg, #16a34a, #15803d)' :
                                            'linear-gradient(135deg, var(--primary), var(--primary-light))',
                                color: '#fff',
                                padding: '16px 20px'
                            }}>
                                <div className="clinical-modal__patient" style={{ gap: '12px' }}>
                                    <span className="clinical-modal__avatar" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', width: '38px', height: '38px' }}>
                                        {alertModal.type === 'danger' ? <AlertCircle size={20} /> :
                                            alertModal.type === 'warning' ? <AlertTriangle size={20} /> :
                                                alertModal.type === 'success' ? <CheckCircle2 size={20} /> :
                                                    <Info size={20} />}
                                    </span>
                                    <div>
                                        <h2 style={{ fontSize: '15px', color: '#fff', margin: 0, fontWeight: '800' }}>{alertModal.title}</h2>
                                    </div>
                                </div>
                                <button className="clinical-modal__close" onClick={() => setAlertModal({ ...alertModal, show: false })} style={{ color: '#fff' }}><X size={16} /></button>
                            </header>
                            <div className="clinical-modal__body" style={{ padding: '24px 20px', textAlign: 'center' }}>
                                <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, margin: '0 0 24px', fontWeight: '500', whiteSpace: 'pre-wrap' }}>
                                    {alertModal.message}
                                </p>
                                <button
                                    className="action-button"
                                    onClick={() => setAlertModal({ ...alertModal, show: false })}
                                    style={{
                                        width: '100%',
                                        minHeight: '44px',
                                        borderRadius: '12px',
                                        background: alertModal.type === 'danger' ? '#dc2626' :
                                            alertModal.type === 'warning' ? '#d97706' :
                                                alertModal.type === 'success' ? '#16a34a' : 'var(--primary)',
                                        border: 0,
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    }}
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* GENERIC CUSTOM CLINICAL CONFIRMATION MODAL */}
                {confirmModal.show && (
                    <div className="clinical-modal show" style={{ zIndex: 10005 }}>
                        <div className="clinical-modal__backdrop" onClick={() => setConfirmModal({ ...confirmModal, show: false })} />
                        <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '460px', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                            <header className="clinical-modal__header" style={{
                                background: confirmModal.type === 'danger' ? 'linear-gradient(135deg, #dc2626, #991b1b)' :
                                    confirmModal.type === 'success' ? 'linear-gradient(135deg, #16a34a, #15803d)' :
                                        'linear-gradient(135deg, var(--primary), var(--primary-light))',
                                color: '#fff',
                                padding: '16px 20px'
                            }}>
                                <div className="clinical-modal__patient" style={{ gap: '12px' }}>
                                    <span className="clinical-modal__avatar" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', width: '38px', height: '38px' }}>
                                        {confirmModal.type === 'danger' ? <AlertCircle size={20} /> :
                                            confirmModal.type === 'success' ? <CheckCircle2 size={20} /> :
                                                <Info size={20} />}
                                    </span>
                                    <div>
                                        <h2 style={{ fontSize: '15px', color: '#fff', margin: 0, fontWeight: '800' }}>{confirmModal.title}</h2>
                                    </div>
                                </div>
                                <button className="clinical-modal__close" onClick={() => setConfirmModal({ ...confirmModal, show: false })} style={{ color: '#fff' }}><X size={16} /></button>
                            </header>
                            <div className="clinical-modal__body" style={{ padding: '24px 20px' }}>
                                <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, margin: '0 0 24px', textAlign: 'center', fontWeight: '500' }}>
                                    {confirmModal.message}
                                </p>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                                        style={{
                                            flex: 1,
                                            minHeight: '44px',
                                            borderRadius: '12px',
                                            background: '#f1f5f9',
                                            border: '1px solid var(--border)',
                                            color: 'var(--text-primary)',
                                            fontWeight: 'bold',
                                            fontSize: '12.5px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {confirmModal.cancelText || 'Cancelar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const action = confirmModal.onConfirm;
                                            setConfirmModal({ ...confirmModal, show: false });
                                            if (action) action();
                                        }}
                                        style={{
                                            flex: 1,
                                            minHeight: '44px',
                                            borderRadius: '12px',
                                            background: confirmModal.type === 'danger' ? '#dc2626' :
                                                confirmModal.type === 'success' ? '#16a34a' :
                                                    'var(--primary)',
                                            border: 0,
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            fontSize: '12.5px',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                        }}
                                    >
                                        {confirmModal.confirmText || 'Confirmar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PacienteDashboard;
