import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';
import '../../medical.css'; // Estilos unificados médicos y psicológicos
import '../../dentist.css'; // Estilos específicos de odontología
import HelpPanel from '../../components/HelpPanel';
import UserProfileMenu from '../../components/UserProfileMenu';
import NotificationMenu from '../../components/NotificationMenu';
import PasswordRequirements from '../../components/PasswordRequirements';
import { useClinicalDraft } from '../../hooks/useClinicalDraft';
import { logoBienestar } from '../../assets/logoBienestarBase64.js';
import { headerBienestar } from '../../assets/headerBienestarBase64.js';
import { logoUebTexto } from '../../assets/logoUebTextoBase64.js';

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
    ChevronLeft,
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

// Mapeos para traducir de notación FDI (frontend) a Sistema Universal (base de datos 1-32 y A-T)
const fdiToUniversal = {
    // Dientes Permanentes (1-32)
    18: 1, 17: 2, 16: 3, 15: 4, 14: 5, 13: 6, 12: 7, 11: 8,
    21: 9, 22: 10, 23: 11, 24: 12, 25: 13, 26: 14, 27: 15, 28: 16,
    38: 17, 37: 18, 36: 19, 35: 20, 34: 21, 33: 22, 32: 23, 31: 24,
    41: 25, 42: 26, 43: 27, 44: 28, 45: 29, 46: 30, 47: 31, 48: 32,
    // Dientes Temporales / Deciduos (A-T)
    55: 'A', 54: 'B', 53: 'C', 52: 'D', 51: 'E',
    61: 'F', 62: 'G', 63: 'H', 64: 'I', 65: 'J',
    71: 'K', 72: 'L', 73: 'M', 74: 'N', 75: 'O',
    81: 'P', 82: 'Q', 83: 'R', 84: 'S', 85: 'T'
};

const getCarillaDbName = (toothNum, face) => {
    if (face === 'top') return 'Vestibular';
    if (face === 'bottom') return 'Lingual/Palatal';
    if (face === 'center') return 'Oclusal';

    const firstDigit = Math.floor(toothNum / 10);
    const isRightSide = (firstDigit === 1 || firstDigit === 4 || firstDigit === 5 || firstDigit === 8);

    if (isRightSide) {
        return face === 'right' ? 'Mesial' : 'Distal';
    } else {
        return face === 'left' ? 'Mesial' : 'Distal';
    }
};

const getSvgFaceName = (toothNum, carillaName) => {
    if (!carillaName) return null;
    const cName = carillaName.toLowerCase();
    if (cName === 'vestibular') return 'top';
    if (cName === 'lingual/palatal' || cName === 'lingual' || cName === 'palatal') return 'bottom';
    if (cName === 'oclusal') return 'center';

    const firstDigit = Math.floor(toothNum / 10);
    const isRightSide = (firstDigit === 1 || firstDigit === 4 || firstDigit === 5 || firstDigit === 8);

    if (isRightSide) {
        if (cName === 'mesial') return 'right';
        if (cName === 'distal') return 'left';
    } else {
        if (cName === 'mesial') return 'left';
        if (cName === 'distal') return 'right';
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

    const handleNavigateToCitasFromNotif = (fecha) => {
        if (fecha) {
            setCitasDate(fecha);
        }
        setActiveTab('citas');
    };

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
    const getDefaultHorario = () => {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const endH = `${pad(now.getHours())}h${pad(now.getMinutes())}`;
        const startObj = new Date(now.getTime() - 20 * 60000);
        const startH = `${pad(startObj.getHours())}h${pad(startObj.getMinutes())}`;
        return { startH, endH };
    };

    const [certModal, setCertModal] = useState({
        isOpen: false,
        fromStep7: false,
        record: null,
        tipo: 'asistencia', // 'asistencia' | 'reposo'
        horarioInicio: '08h00',
        horarioFin: '08h30',
        diagnostico: '',
        cie10: '',
        piezaDental: '',
        tiempoReposo: '48 horas',
        procedimiento: '',
        doctorName: ''
    });

    const handlePrintOfficialCertificate = (data) => {
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
                "enero", "febrero", "marzo", "abril", "mayo", "junio",
                "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
            ];
            const monthName = months[today.getMonth()];
            const dayNum = today.getDate();
            const fechaEmisionTexto = `${dayNum} de ${monthName} del ${year}`;

            const isReposo = data.tipo === 'reposo';
            const patientName = selectedPatient.nombre_completo || selectedPatient.name || 'Paciente';
            const cedula = selectedPatient.cedula || selectedPatient.numero_cedula || '—';
            const horario = `${data.horarioInicio || '08h00'} a ${data.horarioFin || '08h30'}`;
            const diag = data.diagnostico || 'odontalgia';
            const cie10Text = data.cie10 && data.cie10.trim() ? ` (${data.cie10.trim()})` : '';
            const piezaText = data.piezaDental && data.piezaDental.trim() ? `, Pieza Dental ${data.piezaDental.trim()}` : '';
            const tiempoReposo = data.tiempoReposo || '48 horas';
            const proc = data.procedimiento || 'procedimiento odontológico';
            const doctorName = data.doctorName || user?.name || 'Dra. Andrea García León';

            const htmlContent = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>${isReposo ? 'Certificado de Reposo' : 'Certificado de Asistencia'} - ${patientName}</title>
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 22mm 24mm 22mm 24mm;
                        }
                        body {
                            font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
                            font-size: 11pt;
                            color: #000000;
                            margin: 0;
                            padding: 20px;
                            background-color: #f1f5f9;
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
                            padding: 22mm 24mm;
                            box-sizing: border-box;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                            position: relative;
                        }
                        .header-banner {
                            width: 100%;
                            text-align: center;
                            margin-bottom: 25px;
                        }
                        .header-banner img {
                            width: 100%;
                            max-width: 660px;
                            height: auto;
                            display: block;
                            margin: 0 auto;
                        }
                        .doctor-sub-header {
                            text-align: center;
                            margin-bottom: 25px;
                            font-size: 11pt;
                            color: #000;
                        }
                        .doctor-sub-header strong {
                            display: block;
                            font-size: 11pt;
                            color: #000;
                        }
                        .cert-title {
                            text-align: center;
                            font-size: 13pt;
                            font-weight: bold;
                            letter-spacing: 0.5px;
                            color: #000;
                            margin: ${isReposo ? '35px 0 30px 0' : '20px 0 30px 0'};
                            text-transform: uppercase;
                        }
                        .cert-body {
                            font-size: 11pt;
                            line-height: 1.85;
                            text-align: justify;
                            color: #000;
                            margin-bottom: 30px;
                        }
                        .cert-body p {
                            margin: 0 0 25px 0;
                            text-align: justify;
                            font-size: 11pt;
                            line-height: 1.85;
                        }
                        .cert-date {
                            text-align: center;
                            font-size: 11pt;
                            color: #000;
                            margin: 45px 0 60px 0;
                        }
                        .signature-section {
                            text-align: center;
                            margin-top: 50px;
                        }
                        .signature-line {
                            width: 250px;
                            border-top: 1px solid #000;
                            margin: 0 auto 8px auto;
                        }
                        .signature-name {
                            font-size: 11pt;
                            font-weight: bold;
                            color: #000;
                        }
                        .signature-role {
                            font-size: 10pt;
                            color: #333;
                        }
                        @media print {
                            body {
                                background: transparent;
                                padding: 0;
                                margin: 0;
                            }
                            .page-sheet {
                                box-shadow: none;
                                padding: 0;
                                margin: 0;
                                width: 100%;
                                min-height: auto;
                            }
                            * {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="page-sheet">
                        <div class="header-banner">
                            <img src="${headerBienestar}" alt="UEB | Bienestar Universitario" />
                        </div>

                        ${!isReposo ? `
                        <div class="doctor-sub-header">
                            <strong>${doctorName}</strong>
                            <span>Odontóloga de Bienestar Universitario</span>
                        </div>
                        ` : ''}

                        <div class="cert-title">
                            ${isReposo ? 'CERTIFICADO DE REPOSO' : 'CERTIFICADO DE ASISTENCIA'}
                        </div>

                        <div class="cert-body">
                            <p>
                                Por medio de la presente certifico haber atendido al paciente <strong>${patientName}</strong>, con cédula de identidad <strong>${cedula}</strong>, es atendido en el horario de <strong>${horario}</strong>, por presentar odontalgia con Diagnóstico Definitivo <strong>${diag}${cie10Text}</strong>${isReposo ? `${piezaText}. Necesita reposo de <strong>${tiempoReposo}</strong> para su pronta recuperación, se acompaña terapia antiinflamatoria.` : `, Se realiza <strong>${proc}</strong>, <strong>NO NECESITA REPOSO</strong>.`}
                            </p>
                            <p>
                                Por el cual el paciente puede hacer uso de este documento para trámites académicos.
                            </p>
                        </div>

                        <div class="cert-date">
                            Guaranda, ${fechaEmisionTexto}
                        </div>

                        <div class="signature-section">
                            <div class="signature-line"></div>
                            <div class="signature-name">${doctorName}</div>
                            <div class="signature-role">Odontóloga de Bienestar Universitario</div>
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
            console.error("Error al imprimir certificado:", err);
            showSystemToast("Error al generar el certificado para impresión.");
        }
    };

    const handleOpenCertModalFromStep7 = () => {
        const { startH, endH } = getDefaultHorario();
        setCertModal({
            isOpen: true,
            fromStep7: true,
            record: null,
            tipo: 'asistencia',
            horarioInicio: startH,
            horarioFin: endH,
            diagnostico: fichaForm.detalle_diagnostico || fichaForm.detalle_motivo || 'Odontalgia',
            cie10: '',
            piezaDental: '',
            tiempoReposo: '48 horas',
            procedimiento: fichaForm.procedimiento || 'Evaluación Odontológica',
            doctorName: user?.name || 'Dra. Andrea García León'
        });
    };

    const handleOpenCertModalFromRecord = (record) => {
        if (!selectedPatient) return;
        const isEvol = record?.type === 'evolucion';
        const diag = isEvol ? (record.detalle_evolucion || 'Evolución Odontológica') : (record?.detalle_diagnostico || 'Consulta Dental');
        const proc = isEvol ? 'Tratamiento y Seguimiento' : (record?.procedimiento || 'Evaluación Odontológica');
        const { startH, endH } = getDefaultHorario();

        setCertModal({
            isOpen: true,
            fromStep7: false,
            record: record || null,
            tipo: 'asistencia',
            horarioInicio: record?.hora_inicio ? record.hora_inicio.replace(':', 'h').slice(0, 5) : startH,
            horarioFin: record?.hora_fin ? record.hora_fin.replace(':', 'h').slice(0, 5) : endH,
            diagnostico: diag,
            cie10: '',
            piezaDental: '',
            tiempoReposo: '48 horas',
            procedimiento: proc,
            doctorName: user?.name || 'Dra. Andrea García León'
        });
    };

    const handleConfirmEmitirCertificado = async () => {
        if (certModal.fromStep7) {
            setFichaSaving(true);
            try {
                await handleSaveFichaSection('diagnostico', 'certificadomedico');
                await handleSaveOdontograma();

                handleCloseFichaForm(true);
                showSystemToast("Atención médica guardada y certificado emitido exitosamente.");
            } catch (err) {
                console.error("Error al finalizar atención con certificado:", err);
                showSystemToast("Error al guardar la atención médica.");
                setFichaSaving(false);
                return;
            } finally {
                setFichaSaving(false);
            }
        }

        handlePrintOfficialCertificate(certModal);
        setCertModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleSaveAndFinish = async (generateCertificate = false) => {
        if (generateCertificate) {
            handleOpenCertModalFromStep7();
            return;
        }

        setFichaSaving(true);
        try {
            await handleSaveFichaSection('diagnostico', null);
            await handleSaveOdontograma();

            handleCloseFichaForm(true);
            showSystemToast("Atención médica guardada exitosamente. Podrá otorgar certificados en cualquier momento desde la pestaña Evolución.");
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

    // Inicializar los dientes del adulto y temporales (FDI notation)
    const upperRightTeeth = [18, 17, 16, 15, 14, 13, 12, 11];
    const upperLeftTeeth = [21, 22, 23, 24, 25, 26, 27, 28];
    const upperRightDeciduous = [55, 54, 53, 52, 51];
    const upperLeftDeciduous = [61, 62, 63, 64, 65];
    const lowerRightDeciduous = [85, 84, 83, 82, 81];
    const lowerLeftDeciduous = [71, 72, 73, 74, 75];
    const lowerLeftTeeth = [31, 32, 33, 34, 35, 36, 37, 38];
    const lowerRightTeeth = [48, 47, 46, 45, 44, 43, 42, 41];

    const initialTeethState = () => {
        const teeth = {};
        const allTeeth = [
            ...upperRightTeeth, ...upperLeftTeeth,
            ...upperRightDeciduous, ...upperLeftDeciduous,
            ...lowerRightDeciduous, ...lowerLeftDeciduous,
            ...lowerRightTeeth, ...lowerLeftTeeth
        ];
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
    // Tratamientos agrupados y control de despliegue
    const [expandedTreatments, setExpandedTreatments] = useState({});
    const [evolutionViewMode, setEvolutionViewMode] = useState('tratamientos'); // 'tratamientos' | 'todas'
    const [isEvolucionModalOpen, setIsEvolucionModalOpen] = useState(false);

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
    // 5. ESTADOS DE HISTORIAL GENERAL DENTAL
    // ==========================================
    const [historialList, setHistorialList] = useState([]);
    const [historialType, setHistorialType] = useState('all'); // all | evolucion | diario
    const [historialSearch, setHistorialSearch] = useState('');
    const [historialDate, setHistorialDate] = useState('');
    const [activeReportSubTab, setActiveReportSubTab] = useState('diario');
    const diarioIframeRef = useRef(null);
    const insumosIframeRef = useRef(null);
    const citasIframeRef = useRef(null);
    const mensualIframeRef = useRef(null);
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
    const [reportMensualFecha, setReportMensualFecha] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
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
    const [procedureCurrentPage, setProcedureCurrentPage] = useState(1);

    useEffect(() => {
        setProcedureCurrentPage(1);
    }, [procedureSearchQuery]);

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

        // Si la pestaña activa es evolución, historial u odontograma, solo seleccionamos el paciente para consultar sus registros
        if ((activeTab === 'evolucion' || activeTab === 'historial' || activeTab === 'odontograma') && !forceOpenModal) {
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

    const handleCloseFichaForm = (keepPatient = false) => {
        setIsFichaModalOpen(false);
        if (!keepPatient) {
            setSelectedPatient(null);
        }
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
                            key => String(fdiToUniversal[key]).toUpperCase() === String(universalNum).toUpperCase()
                        );
                        if (!fdiNum || !mapState[fdiNum]) return;

                        if (assign.id_numero_carilla === null) {
                            // Asignación de pieza completa (ej. Ausente)
                            const stateObj = assign.estado || odontogramaEstados.find(e => e.id === assign.id_estado);
                            const stateName = stateObj ? stateObj.nombre.toLowerCase() : '';
                            if (stateName === 'ausente' || assign.id_estado === 4) {
                                mapState[fdiNum].ausente = true;
                            }
                        } else {
                            // Asignación de carilla
                            const carillaName = assign.carilla ? assign.carilla.numero_carilla.toLowerCase() : '';
                            const face = getSvgFaceName(parseInt(fdiNum), carillaName);
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
        if (!selectedPatient) return true;
        const patId = selectedPatient.id_usuario || selectedPatient.id || selectedPatient.id_paciente;
        if (!patId) return true;

        setOdontogramaSaving(true);

        try {
            // Asegurar catálogo dental
            let catalog = dentalCatalog;
            if (!catalog || catalog.length === 0) {
                try {
                    const catRes = await api.get('/odontologia/odontograma-catalogo');
                    catalog = catRes?.data?.data || [];
                    setDentalCatalog(catalog);
                } catch (ce) {
                    console.error("Error fetching catalog in save:", ce);
                }
            }

            const stateMap = {
                'caries': 1,
                'obturado': 2,
                'corona': 3,
                'ausente': 4
            };

            const resolveStateId = (stateVal) => {
                if (typeof stateVal === 'number' && !isNaN(stateVal)) return stateVal;
                if (typeof stateVal === 'string') {
                    const parsed = parseInt(stateVal);
                    if (!isNaN(parsed) && String(parsed) === stateVal.trim()) return parsed;
                    const found = odontogramaEstados.find(e =>
                        e.nombre.toLowerCase() === stateVal.toLowerCase() ||
                        String(e.id) === stateVal
                    );
                    if (found) return found.id;
                    return stateMap[stateVal.toLowerCase()] || 1;
                }
                return 1;
            };

            const payloadAsignaciones = [];
            const localDate = getLocalDateString();

            for (const fdiNumStr of Object.keys(odontogramaState)) {
                const fdiNum = parseInt(fdiNumStr);
                const toothVal = odontogramaState[fdiNum];
                if (!toothVal) continue;
                const universalNum = fdiToUniversal[fdiNum];

                const piece = catalog.find(p => String(p.numero_pieza_dental).toUpperCase() === String(universalNum).toUpperCase());
                if (!piece) continue;

                const pieceId = piece.id;

                if (toothVal.ausente) {
                    const ausenteStateId = resolveStateId('ausente');
                    payloadAsignaciones.push({
                        id_numero_pieza: pieceId,
                        id_numero_carilla: null,
                        id_estado: ausenteStateId,
                        fecha: localDate
                    });
                } else {
                    const faces = ['top', 'bottom', 'left', 'right', 'center'];
                    for (const face of faces) {
                        const faceState = toothVal[face];
                        if (!faceState || faceState === 'sano') continue;

                        const carillaName = getCarillaDbName(fdiNum, face);
                        const carilla = piece.carillas?.find(
                            c => c.numero_carilla.toLowerCase() === carillaName.toLowerCase()
                        );
                        if (!carilla) continue;

                        const stId = resolveStateId(faceState);
                        payloadAsignaciones.push({
                            id_numero_pieza: pieceId,
                            id_numero_carilla: carilla.id,
                            id_estado: stId,
                            fecha: localDate
                        });
                    }
                }
            }

            // Sincronización atómica con el backend
            const syncRes = await api.post(`/odontologia/odontograma-paciente/${patId}/sync`, {
                asignaciones: payloadAsignaciones
            });

            if (syncRes?.data?.data) {
                setPatientOdontograma(syncRes.data.data);
            }

            showSystemToast("Odontograma guardado correctamente.");
            await fetchOdontograma(patId);
            return true;
        } catch (err) {
            console.error("Error al guardar odontograma:", err);
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
            const detailed = await Promise.all(
                filtered.map(async (item) => {
                    const patId = item.id_usuario_paciente || item.paciente?.id;
                    if (!patId) return item;
                    if (item.paciente?.datos_identificacion || item.paciente?.datosIdentificacion) {
                        return item;
                    }
                    try {
                        const patRes = await api.get(`/medicina-general/pacientes/${patId}/perfil`);
                        return { ...item, paciente: patRes.data.data };
                    } catch (e) {
                        return item;
                    }
                })
            );
            setParteDiarioList(detailed);
        } catch (err) {
            console.error(err);
        } finally {
            setParteDiarioLoading(false);
        }
    };

    const compileParteDiarioHtmlString = (forPrint = false) => {
        const detailedList = parteDiarioList || [];

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

        return `
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
                        width: 140px;
                        display: flex;
                        align-items: center;
                    }
                    .header-logo img {
                        max-height: 48px;
                        width: auto;
                        object-fit: contain;
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
                                <img src="${logoBienestar}" alt="Bienestar Universitario UEB" style="max-height: 48px; width: auto; object-fit: contain;" />
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

                ${forPrint ? `
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 300);
                        };
                    </script>
                ` : ''}
            </body>
            </html>
        `;
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
            try {
                const hiddenFrame = document.createElement('iframe');
                hiddenFrame.style.position = 'fixed';
                hiddenFrame.style.right = '0';
                hiddenFrame.style.bottom = '0';
                hiddenFrame.style.width = '0';
                hiddenFrame.style.height = '0';
                hiddenFrame.style.border = '0';
                document.body.appendChild(hiddenFrame);
                hiddenFrame.contentWindow.document.open();
                hiddenFrame.contentWindow.document.write(getFallbackHtml());
                hiddenFrame.contentWindow.document.close();
                setTimeout(() => {
                    hiddenFrame.contentWindow.focus();
                    hiddenFrame.contentWindow.print();
                    setTimeout(() => {
                        if (document.body.contains(hiddenFrame)) {
                            document.body.removeChild(hiddenFrame);
                        }
                    }, 1000);
                }, 300);
            } catch (fallbackErr) {
                console.error('Fallback print failed:', fallbackErr);
            }
        }
    };

    const handlePrintParteDiario = () => {
        if (parteDiarioList.length === 0) {
            showSystemToast('No hay atenciones en esta fecha para generar el reporte.');
            return;
        }
        printIframeDocument(diarioIframeRef, () => compileParteDiarioHtmlString(false));
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
        handleOpenCertModalFromRecord(record);
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
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
                    <div style="width: 140px; display: flex; align-items: center;">
                        <img src="${logoBienestar}" alt="Bienestar Universitario UEB" style="max-height: 48px; width: auto; object-fit: contain;" />
                    </div>
                    <div style="text-align: center; flex: 1;">
                        <h2 style="margin: 0 0 4px 0; font-size: 15px; font-weight: bold; text-transform: uppercase;">Universidad Estatal de Bolívar</h2>
                        <h3 style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #475569;">Bienestar Universitario</h3>
                        <h3 style="margin: 0 0 4px 0; font-size: 11px; font-weight: bold; text-transform: uppercase;">Consumo Diario de Materiales Odontológicos Unidad Operativa</h3>
                    </div>
                    <div style="width: 140px; text-align: right; font-weight: bold; font-size: 11px; color: #1e293b;">
                        ODONTOLOGÍA
                    </div>
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
        printIframeDocument(insumosIframeRef, () => compileInsumosReportHtmlString());
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

    const getFacultyNarrativeTitle = (facName) => {
        const fUpper = (facName || '').toUpperCase();
        if (fUpper.includes('SALUD')) return 'Facultad de la Salud';
        if (fUpper.includes('JURISPRUDENCIA')) return 'Facultad de Jurisprudencia';
        if (fUpper.includes('ADMINISTRATIVAS')) return 'Facultad Ciencias Administrativas';
        if (fUpper.includes('AGROPECUARIAS')) return 'Facultad Ciencias Agropecuarias';
        if (fUpper.includes('EDUCACIÓN') || fUpper.includes('EDUCACION')) return 'Facultad Ciencias de la Educación';
        return `Facultad de ${facName}`;
    };

    const buildFacultyNarrative = (facName, careersObj) => {
        const careers = careersObj || {};
        const title = getFacultyNarrativeTitle(facName);
        let facH = 0;
        let facM = 0;
        let facL = 0;
        let facTotal = 0;
        const careerSentences = [];

        Object.entries(careers).forEach(([cName, stats]) => {
            facH += stats.hombres || 0;
            facM += stats.mujeres || 0;
            facL += stats.lgbti || 0;
            facTotal += stats.total || 0;

            if ((stats.total || 0) > 0) {
                let part = '';
                if (stats.hombres > 0 && stats.mujeres > 0) {
                    part = `${stats.hombres} hombre${stats.hombres > 1 ? 's' : ''} y ${stats.mujeres} mujer${stats.mujeres > 1 ? 'es' : ''}`;
                } else if (stats.hombres > 0) {
                    part = `${stats.hombres} hombre${stats.hombres > 1 ? 's' : ''}`;
                } else if (stats.mujeres > 0) {
                    part = `${stats.mujeres} mujer${stats.mujeres > 1 ? 'es' : ''}`;
                }
                if (stats.lgbti > 0) {
                    part += (part ? `, ` : '') + `${stats.lgbti} LGBTI`;
                }
                const cLower = cName.toLowerCase();
                let prefix = 'En la Carrera de';
                if (cLower.startsWith('centro')) {
                    prefix = 'En el';
                } else if (cLower.startsWith('carrera')) {
                    prefix = 'En la';
                } else if (cLower.startsWith('educación') || cLower.startsWith('educacion') || cLower.startsWith('pedagogía') || cLower.startsWith('pedagogia') || cLower.startsWith('fisicomatemático') || cLower.startsWith('fisicomatematico')) {
                    prefix = 'En la Carrera';
                }
                careerSentences.push(`${prefix} ${cName} ${part}.`);
            }
        });

        if (facTotal === 0) {
            return `${title}, no se registraron atenciones a estudiantes durante este período.`;
        }

        const fUpper = facName.toUpperCase();
        let verbClause = 'la atención fue a';
        if (fUpper.includes('JURISPRUDENCIA')) verbClause = 'se atendió a';

        const hasComma = fUpper.includes('SALUD') || fUpper.includes('JURISPRUDENCIA');
        let intro = `${title}${hasComma ? ',' : ''} ${verbClause} ${facTotal} estudiantes, ${facH} hombres y ${facM} mujeres`;
        if (facL > 0) intro += `, ${facL} LGBTI`;
        intro += '.';

        return `${intro} ${careerSentences.join(' ')}`;
    };

    const buildPreventivasNarrative = (pStats) => {
        const exam = pStats?.['Examen Odontológico'] || {
            estudiantes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
            administrativos: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
            docentes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
        };

        const parts = [];
        const estH = exam.estudiantes?.hombres || 0;
        const estM = exam.estudiantes?.mujeres || 0;
        const estT = exam.estudiantes?.total || 0;
        let detEst = '';
        if (estH > 0 && estM > 0) detEst = `a ${estH} hombres y ${estM} mujeres`;
        else if (estH > 0) detEst = `a ${estH} hombre${estH > 1 ? 's' : ''}`;
        else if (estM > 0) detEst = `a ${estM} mujer${estM > 1 ? 'es' : ''}`;
        else detEst = `a 0 personas`;
        parts.push(`<strong>Estudiantes:</strong> Examen Odontológicos ${detEst}.`);

        const admH = exam.administrativos?.hombres || 0;
        const admM = exam.administrativos?.mujeres || 0;
        const admT = exam.administrativos?.total || 0;
        if (admT > 0) {
            let detAdm = '';
            if (admH > 0 && admM > 0) detAdm = `a ${admH} hombres y ${admM} mujeres`;
            else if (admH > 0) detAdm = `a ${admH} hombre${admH > 1 ? 's' : ''}`;
            else if (admM > 0) detAdm = `a ${admM} mujer${admM > 1 ? 'es' : ''}`;
            parts.push(`<strong>Administrativos:</strong> Examen Odontológico ${detAdm}.`);
        }

        const docH = exam.docentes?.hombres || 0;
        const docM = exam.docentes?.mujeres || 0;
        const docT = exam.docentes?.total || 0;
        if (docT > 0) {
            let detDoc = '';
            if (docH > 0 && docM > 0) detDoc = `a ${docH} hombres y ${docM} mujeres`;
            else if (docH > 0) detDoc = `a ${docH} hombre${docH > 1 ? 's' : ''}`;
            else if (docM > 0) detDoc = `a ${docM} mujer${docM > 1 ? 'es' : ''}`;
            parts.push(`<strong>Docentes:</strong> Examen Odontológico ${detDoc}.`);
        }

        return parts.join(' ');
    };

    const defaultFacultyCareers = {
        'CIENCIAS DE LA SALUD': [
            'Enfermería',
            'Gestión de Riesgos',
            'Psicología',
            'Terapia Física'
        ],
        'JURISPRUDENCIA': [
            'Criminalística',
            'Derecho',
            'Sociología'
        ],
        'CIENCIAS ADMINISTRATIVAS': [
            'Ad. Empresas',
            'Comunicación',
            'Cont. Auditoría',
            'Emprendimiento e Innovación',
            'Gestión del Talento Humano',
            'Marketing Digital',
            'Mercadotecnia',
            'Software',
            'Tecnología de la Informática',
            'Turismo'
        ],
        'CIENCIAS AGROPECUARIAS': [
            'Agroindustria',
            'Agronomía',
            'Med. Veterinaria'
        ],
        'CIENCIAS DE LA EDUCACIÓN': [
            'Educación Básica',
            'Educación Inicial',
            'Educación Intercultural',
            'Fisicomatemático',
            'Pedagogía Idiomas Nacionales',
            'Pedagogía de la Informática',
            'Centro de Desarrollo Infantil'
        ]
    };

    const mapToCanonicalCareer = (rawCareerName) => {
        if (!rawCareerName) return '';
        const norm = rawCareerName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        if (norm.includes('enferm')) return 'Enfermería';
        if (norm.includes('riesgo')) return 'Gestión de Riesgos';
        if (norm.includes('psicol')) return 'Psicología';
        if (norm.includes('terapia')) return 'Terapia Física';
        if (norm.includes('crimin')) return 'Criminalística';
        if (norm.includes('derecho')) return 'Derecho';
        if (norm.includes('socio')) return 'Sociología';
        if (norm.includes('admin') || norm.includes('empresa')) return 'Ad. Empresas';
        if (norm.includes('comunic')) return 'Comunicación';
        if (norm.includes('contab') || norm.includes('auditor')) return 'Cont. Auditoría';
        if (norm.includes('emprend') || norm.includes('innov')) return 'Emprendimiento e Innovación';
        if (norm.includes('talento') || norm.includes('humano')) return 'Gestión del Talento Humano';
        if (norm.includes('market')) return 'Marketing Digital';
        if (norm.includes('mercad')) return 'Mercadotecnia';
        if (norm.includes('softw')) return 'Software';
        if (norm.includes('tecno') || (norm.includes('informa') && !norm.includes('pedagog'))) return 'Tecnología de la Informática';
        if (norm.includes('turis')) return 'Turismo';
        if (norm.includes('agroin')) return 'Agroindustria';
        if (norm.includes('agron')) return 'Agronomía';
        if (norm.includes('veterin')) return 'Med. Veterinaria';
        if (norm.includes('basica')) return 'Educación Básica';
        if (norm.includes('inicial')) return 'Educación Inicial';
        if (norm.includes('intercult') || norm.includes('biling')) return 'Educación Intercultural';
        if (norm.includes('fisico') || norm.includes('psicomate')) return 'Fisicomatemático';
        if (norm.includes('idioma') || norm.includes('ingles')) return 'Pedagogía Idiomas Nacionales';
        if (norm.includes('pedagog') && norm.includes('informa')) return 'Pedagogía de la Informática';
        if (norm.includes('desarrollo') || norm.includes('infantil')) return 'Centro de Desarrollo Infantil';
        return rawCareerName;
    };

    const buildCurativasNarrative = (curativoStats, curDiagnosesList) => {
        const stats = curativoStats || {};
        const diagList = curDiagnosesList || [];
        const groups = [
            { key: 'estudiantes', label: 'Estudiantes' },
            { key: 'administrativos', label: 'Administrativos' },
            { key: 'docentes', label: 'Docentes' }
        ];

        const parts = [];

        groups.forEach(g => {
            const diagsFound = [];
            diagList.forEach(diag => {
                const r = stats[diag]?.[g.key];
                if ((r?.total || 0) > 0) {
                    diagsFound.push({ diag, h: r.hombres || 0, m: r.mujeres || 0 });
                }
            });

            if (diagsFound.length > 0) {
                const sentences = diagsFound.map((item, idx) => {
                    let det = '';
                    if (item.h > 0 && item.m > 0) det = `${item.h} hombre${item.h > 1 ? 's' : ''} y ${item.m} mujer${item.m > 1 ? 'es' : ''}`;
                    else if (item.h > 0) det = `${item.h} hombre${item.h > 1 ? 's' : ''}`;
                    else if (item.m > 0) det = `${item.m} mujer${item.m > 1 ? 'es' : ''}`;

                    if (idx === 0) {
                        return `${item.diag} a ${det}`;
                    }
                    return `${item.diag} ${det}`;
                });
                parts.push(`<strong>${g.label}:</strong> ${sentences.join('. ')}.`);
            }
        });

        return parts.length > 0 ? parts.join('<br/><br/>') : 'Sin atenciones curativas registradas.';
    };

    const buildProcedimientosPreventivosNarrative = (procPreventivos) => {
        const p = procPreventivos || {};
        const groups = [
            { key: 'estudiantes', label: 'Estudiantes:' },
            { key: 'administrativos', label: 'Administrativos:' },
            { key: 'docentes', label: 'Docente:' }
        ];

        const parts = [];

        groups.forEach(g => {
            const items = [];
            const prof = p['PROFILAXIS']?.[g.key];
            const fluor = p['FLUORIZACIÓN']?.[g.key];

            const profTotal = (prof?.hombres || 0) + (prof?.mujeres || 0);
            if (profTotal > 0) {
                let det = '';
                if ((prof.hombres || 0) > 0 && (prof.mujeres || 0) > 0) {
                    det = `${prof.hombres} hombres y ${prof.mujeres} mujeres`;
                } else if ((prof.hombres || 0) > 0) {
                    det = `${prof.hombres} hombre${prof.hombres > 1 ? 's' : ''}`;
                } else if ((prof.mujeres || 0) > 0) {
                    det = `${prof.mujeres} mujer${prof.mujeres > 1 ? 'es' : ''}`;
                }
                items.push(`Profilaxis a ${det}`);
            }

            const fluorTotal = (fluor?.hombres || 0) + (fluor?.mujeres || 0);
            if (fluorTotal > 0) {
                let det = '';
                if ((fluor.hombres || 0) > 0 && (fluor.mujeres || 0) > 0) {
                    det = `${fluor.hombres} hombres y ${fluor.mujeres} mujeres`;
                } else if ((fluor.hombres || 0) > 0) {
                    det = `${fluor.hombres} hombre${fluor.hombres > 1 ? 's' : ''}`;
                } else if ((fluor.mujeres || 0) > 0) {
                    det = `${fluor.mujeres} mujer${fluor.mujeres > 1 ? 'es' : ''}`;
                }
                items.push(`Fluorización a ${det}`);
            }

            if (items.length > 0) {
                parts.push(`<strong>${g.label}</strong> ${items.join('. ')}.`);
            }
        });

        return parts.length > 0 ? parts.join('<br/><br/>') : 'Sin procedimientos preventivos registrados.';
    };

    const buildProcedimientosMorbilidadNarrative = (procMorbilidad) => {
        const p = procMorbilidad || {};
        const procList = [
            { key: 'DESTARTRAJE', label: 'Destartraje' },
            { key: 'RESTAURACIÓN PROVISIONAL', label: 'Restauración Provisional' },
            { key: 'RESTAURACIÓN CON RESINA', label: 'Restauración con Resina' },
            { key: 'DESGASTE DE PAREDES', label: 'Desgaste de Paredes', altLabel: { administrativos: 'Desgaste' } },
            { key: 'EXODONCIA', label: 'Exodoncias' },
            { key: 'RECETAS', label: 'Recetas' },
            { key: 'ORDEN DE RX', label: 'Orden de Rx' },
            { key: 'RETIRO DE PUNTOS', label: 'Retiro de Puntos' }
        ];

        const groups = [
            { key: 'estudiantes', label: 'Estudiantes:' },
            { key: 'administrativos', label: 'Administrativos:' },
            { key: 'docentes', label: 'Docente:' }
        ];

        const parts = [];

        groups.forEach(g => {
            const items = [];
            procList.forEach(proc => {
                const r = p[proc.key]?.[g.key];
                const h = r?.hombres || 0;
                const m = r?.mujeres || 0;
                const total = h + m;

                if (total > 0) {
                    let det = '';
                    if (h > 0 && m > 0) {
                        det = `${h} hombres y ${m} mujeres`;
                    } else if (h > 0) {
                        det = `${h} hombre${h > 1 ? 's' : ''}`;
                    } else if (m > 0) {
                        det = `${m} mujer${m > 1 ? 'es' : ''}`;
                    }

                    const procName = proc.altLabel?.[g.key] || proc.label;
                    if (proc.key.includes('RESTAURACIÓN') && (h > 1 || m > 1 || (h + m > 2))) {
                        items.push(`${procName} a ${det}`);
                    } else {
                        items.push(`${procName} ${det}`);
                    }
                }
            });

            if (items.length > 0) {
                parts.push(`<strong>${g.label}</strong> ${items.join('. ')}.`);
            }
        });

        return parts.length > 0 ? parts.join('<br/><br/>') : 'Sin procedimientos de morbilidad registrados.';
    };

    const buildGenderNarrative = (totalPacientes, totalEstudiantes, totalAdministrativos, totalDocentes, genderCounts) => {
        const totalH = (genderCounts?.estudiantes?.hombres || 0) + (genderCounts?.administrativos?.hombres || 0) + (genderCounts?.docentes?.hombres || 0);
        const totalM = (genderCounts?.estudiantes?.mujeres || 0) + (genderCounts?.administrativos?.mujeres || 0) + (genderCounts?.docentes?.mujeres || 0);
        const totalL = (genderCounts?.estudiantes?.lgbti || 0) + (genderCounts?.administrativos?.lgbti || 0) + (genderCounts?.docentes?.lgbti || 0);

        const estH = genderCounts?.estudiantes?.hombres || 0;
        const estM = genderCounts?.estudiantes?.mujeres || 0;
        const admH = genderCounts?.administrativos?.hombres || 0;
        const admM = genderCounts?.administrativos?.mujeres || 0;
        const docH = genderCounts?.docentes?.hombres || 0;
        const docM = genderCounts?.docentes?.mujeres || 0;

        let docText = 'Docente ';
        if (docH > 0 && docM > 0) {
            docText += `${docH} hombres y ${docM} mujeres`;
        } else if (docH > 0) {
            docText += `${docH} hombre${docH > 1 ? 's' : ''}`;
        } else if (docM > 0) {
            docText += `${docM} mujer${docM > 1 ? 'es' : ''}`;
        } else {
            docText += '0 docentes';
        }

        return `El total de la población atendida fue a ${totalPacientes} pacientes ${totalH} hombres y ${totalM} mujeres${totalL > 0 ? `, ${totalL} LGBTI` : ''}, estudiantes ${totalEstudiantes} de los cuales son ${estH} hombres y ${estM} mujeres, ${totalAdministrativos} Administrativos ${admH} hombres y ${admM} mujeres, ${docText}.`;
    };

    const renderFacultyTableJsx = (facName, careersObj) => {
        let careers = careersObj;
        if (!careers || Object.keys(careers).length === 0) {
            careers = {};
            (defaultFacultyCareers[facName] || []).forEach(cName => {
                careers[cName] = { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
            });
        }
        const careerNames = Object.keys(careers);
        if (careerNames.length === 0) return null;

        let facH = 0;
        let facM = 0;
        let facL = 0;
        let facTotal = 0;

        return (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif', border: '1px solid #4b5563', marginBottom: '5px', fontSize: '8px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#cbd5e1', fontWeight: 'bold', fontSize: '8px', textAlign: 'center' }}>
                        <th style={{ border: '1px solid #4b5563', padding: '2px 4px', width: '26%' }}>FACULTAD</th>
                        <th style={{ border: '1px solid #4b5563', padding: '2px 4px', width: '38%' }}>CARRERA</th>
                        <th style={{ border: '1px solid #4b5563', padding: '2px 4px', width: '9%' }}>HOMBRES</th>
                        <th style={{ border: '1px solid #4b5563', padding: '2px 4px', width: '9%' }}>MUJERES</th>
                        <th style={{ border: '1px solid #4b5563', padding: '2px 4px', width: '9%' }}>LGBTI</th>
                        <th style={{ border: '1px solid #4b5563', padding: '2px 4px', width: '9%' }}>TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    {careerNames.map((cName, idx) => {
                        const s = careers[cName];
                        facH += s.hombres || 0;
                        facM += s.mujeres || 0;
                        facL += s.lgbti || 0;
                        facTotal += s.total || 0;
                        return (
                            <tr key={`${facName}-${cName}`} style={{ fontSize: '8px' }}>
                                {idx === 0 && (
                                    <td
                                        rowSpan={careerNames.length}
                                        style={{
                                            border: '1px solid #4b5563',
                                            padding: '2px 4px',
                                            textAlign: 'center',
                                            verticalAlign: 'middle',
                                            fontWeight: 'bold',
                                            backgroundColor: '#cbd5e1',
                                            width: '26%'
                                        }}
                                    >
                                        {facName}
                                    </td>
                                )}
                                <td style={{ border: '1px solid #4b5563', padding: '2px 6px', textAlign: 'left', width: '38%' }}>{cName}</td>
                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center', width: '9%' }}>{s.hombres}</td>
                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center', width: '9%' }}>{s.mujeres}</td>
                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center', width: '9%' }}>{s.lgbti}</td>
                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center', width: '9%', fontWeight: 'bold' }}>{s.total}</td>
                            </tr>
                        );
                    })}
                    <tr style={{ backgroundColor: '#cbd5e1', fontWeight: 'bold', fontSize: '8px' }}>
                        <td colSpan={2} style={{ border: '1px solid #4b5563', padding: '2px 6px', textAlign: 'left' }}>TOTAL</td>
                        <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{facH}</td>
                        <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{facM}</td>
                        <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{facL}</td>
                        <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{facTotal}</td>
                    </tr>
                </tbody>
            </table>
        );
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
                const fn = (facName || '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const cn = (carName || '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                // Revisar coincidencia directa con las 27 carreras oficiales
                for (const [fName, cList] of Object.entries(defaultFacultyCareers)) {
                    if (cList.some(c => c.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === cn)) {
                        return fName;
                    }
                }

                if (cn.includes('CRIMIN') || cn.includes('DERECHO') || cn.includes('SOCIO')) return 'JURISPRUDENCIA';
                if (cn.includes('TALENTO') || cn.includes('ADMINISTRA') || cn.includes('CONTABILIDAD') || cn.includes('TURISMO') || cn.includes('SOFTWARE') || cn.includes('INFORMATICA') || cn.includes('AD. EMPRESA') || cn.includes('COMUNICACION') || cn.includes('MARKETING') || cn.includes('MERCADOTECNIA') || cn.includes('EMPRENDIMIENTO')) return 'CIENCIAS ADMINISTRATIVAS';
                if (cn.includes('AGRO') || cn.includes('VETERINARIA') || cn.includes('AGRONOMIA')) return 'CIENCIAS AGROPECUARIAS';
                if (cn.includes('EDUCACI') || cn.includes('PEDAGOG') || cn.includes('FISICOMATEMATICO') || cn.includes('DESARROLLO INFANTIL') || cn.includes('INICIAL') || cn.includes('BASICA') || cn.includes('BILINGUE')) return 'CIENCIAS DE LA EDUCACIÓN';
                if (cn.includes('ENFERMER') || cn.includes('TERAPIA') || cn.includes('SALUD') || cn.includes('RIESGO') || cn.includes('PSICOL')) return 'CIENCIAS DE LA SALUD';

                if (fn.includes('SALUD') || fn.includes('SER HUMANO')) return 'CIENCIAS DE LA SALUD';
                if (fn.includes('JURIS') || fn.includes('POLIT') || fn.includes('SOCIAL') || fn.includes('DERECHO')) return 'JURISPRUDENCIA';
                if (fn.includes('ADMINISTRATIVA') || fn.includes('EMPRESARIAL') || fn.includes('INFORMATICA') || fn.includes('GESTION')) return 'CIENCIAS ADMINISTRATIVAS';
                if (fn.includes('AGRO') || fn.includes('AMBIENTE') || fn.includes('PECUARIA') || fn.includes('RECURSOS NATURALES')) return 'CIENCIAS AGROPECUARIAS';
                if (fn.includes('EDUCAC') || fn.includes('FILOSOF') || fn.includes('HUMANISTICA')) return 'CIENCIAS DE LA EDUCACIÓN';

                return fn || 'OTRAS';
            };

            const statsByFacultyAndCareer = {};
            reportingFaculties.forEach(f => {
                statsByFacultyAndCareer[f] = {};
                (defaultFacultyCareers[f] || []).forEach(cName => {
                    statsByFacultyAndCareer[f][cName] = {
                        hombres: 0, mujeres: 0, lgbti: 0, total: 0,
                        preventiva: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                        curativa: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
                    };
                });
            });

            // Inicializar las estadísticas de todas las carreras en 0
            dbCarreras.forEach(c => {
                const mappedName = mapToCanonicalCareer(c.nombre);
                const parentFac = dbFacultades.find(f => f.id === c.id_facultad);
                const repFacName = getReportingFacultyName(parentFac?.nombre, mappedName);
                if (statsByFacultyAndCareer[repFacName]) {
                    if (!statsByFacultyAndCareer[repFacName][mappedName]) {
                        statsByFacultyAndCareer[repFacName][mappedName] = {
                            hombres: 0, mujeres: 0, lgbti: 0, total: 0,
                            preventiva: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                            curativa: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
                        };
                    }
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
                    const normPName = patientCareerName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                    let dbCar = dbCarreras.find(c => c.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === normPName);
                    if (!dbCar) {
                        dbCar = dbCarreras.find(c => normPName.includes(c.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()));
                    }
                    canonCareerName = mapToCanonicalCareer(dbCar ? dbCar.nombre : patientCareerName);
                    const parentFac = dbCar ? dbFacultades.find(f => f.id === dbCar.id_facultad) : null;
                    repFacName = getReportingFacultyName(parentFac?.nombre, canonCareerName);
                }

                // Incrementar atenciones preventivas/curativas en los reportes correspondientes
                const isPreventivo = item.tipo_atencion2 === 'preventivo';

                if (userType === 'estudiantes' && canonCareerName && repFacName) {
                    if (!statsByFacultyAndCareer[repFacName]) statsByFacultyAndCareer[repFacName] = {};
                    if (!statsByFacultyAndCareer[repFacName][canonCareerName]) {
                        statsByFacultyAndCareer[repFacName][canonCareerName] = {
                            hombres: 0, mujeres: 0, lgbti: 0, total: 0,
                            preventiva: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                            curativa: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
                        };
                    }

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
                totalFojas: (filteredPartes && filteredPartes.length > 0) ? (new Set(filteredPartes.map(p => p.fecha ? p.fecha.split('T')[0] : (p.created_at ? p.created_at.split('T')[0] : ''))).size || 18) : 18,
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

    const compileGeneralReportHtmlString = (data, forPrint = false) => {
        if (!data) return '';
        try {
            const monthsText = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            const selectedMonthText = monthsText[genReportMonth - 1] || 'Abril';

            const doctorNameText = user?.name || 'Andrea García León';
            const doctorEmail = user?.email || 'angarcia@ueb.edu.ec';
            const reportNo = `006-OD-${genReportYear}`;

            const lastDayOfMonth = new Date(genReportYear, genReportMonth, 0).getDate();
            const reportDateFormatted = `${String(lastDayOfMonth).padStart(2, '0')}/${String(genReportMonth).padStart(2, '0')}/${genReportYear}`;

            const allCanonicalCareersOrdered = Object.values(defaultFacultyCareers).flat();
            const getCareerSortIndex = (careerName) => {
                const idx = allCanonicalCareersOrdered.findIndex(c => c.toLowerCase() === (careerName || '').toLowerCase());
                return idx >= 0 ? idx : 999;
            };
            const activeCareers = Object.keys(data.careerIndividualStats || {}).sort((a, b) => getCareerSortIndex(a) - getCareerSortIndex(b));
            const remainingCareers = activeCareers.slice(1);
            const extraCareerPages = Math.ceil(remainingCareers.length / 2);
            const totalPages = 8 + 1 + extraCareerPages;

            let totalEstCareersCount = 0;
            (data.reportingFaculties || []).forEach(f => {
                totalEstCareersCount += Object.keys(data.statsByFacultyAndCareer?.[f] || {}).length;
            });

        const totalH = (data.genderCounts?.estudiantes?.hombres || 0) + (data.genderCounts?.administrativos?.hombres || 0) + (data.genderCounts?.docentes?.hombres || 0);
        const totalM = (data.genderCounts?.estudiantes?.mujeres || 0) + (data.genderCounts?.administrativos?.mujeres || 0) + (data.genderCounts?.docentes?.mujeres || 0);
        const totalL = (data.genderCounts?.estudiantes?.lgbti || 0) + (data.genderCounts?.administrativos?.lgbti || 0) + (data.genderCounts?.docentes?.lgbti || 0);
        const grandTotal = data.totalPacientes || 0;

        const genderNarrative = buildGenderNarrative(data.totalPacientes, data.totalEstudiantes, data.totalAdministrativos, data.totalDocentes, data.genderCounts);
        const prevExamen = data.consolidadoStats?.preventivo?.['Examen Odontológico'] || {
            estudiantes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
            administrativos: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
            docentes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
        };
        const prevTotal = (prevExamen.estudiantes?.total || 0) + (prevExamen.administrativos?.total || 0) + (prevExamen.docentes?.total || 0);
        const preventivasNarrative = buildPreventivasNarrative(data.consolidadoStats?.preventivo);

        // Variables para Página 4: Curativos y Procedimientos
        let totEstCurH = 0, totEstCurM = 0, totEstCurL = 0, totEstCurT = 0;
        let totAdmCurH = 0, totAdmCurM = 0, totAdmCurL = 0, totAdmCurT = 0;
        let totDocCurH = 0, totDocCurM = 0, totDocCurL = 0, totDocCurT = 0;
        let totGrandCurT = 0;

        const curativosRowsHtml = (data.curativosDiagnoses || []).map(diag => {
            const cur = data.consolidadoStats?.curativo?.[diag] || {
                estudiantes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                administrativos: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                docentes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
            };
            const e = cur.estudiantes || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
            const a = cur.administrativos || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
            const d = cur.docentes || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
            const rowTotal = (e.total || 0) + (a.total || 0) + (d.total || 0);

            totEstCurH += e.hombres || 0; totEstCurM += e.mujeres || 0; totEstCurL += e.lgbti || 0; totEstCurT += e.total || 0;
            totAdmCurH += a.hombres || 0; totAdmCurM += a.mujeres || 0; totAdmCurL += a.lgbti || 0; totAdmCurT += a.total || 0;
            totDocCurH += d.hombres || 0; totDocCurM += d.mujeres || 0; totDocCurL += d.lgbti || 0; totDocCurT += d.total || 0;
            totGrandCurT += rowTotal;

            return `
                <tr style="font-size: 7px;">
                    <td style="border: 1px solid #000; padding: 1.5px 3px; text-align: left;">${diag}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${e.hombres > 0 ? e.hombres : ''}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${e.mujeres > 0 ? e.mujeres : ''}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${e.lgbti || 0}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${e.total || 0}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${a.hombres > 0 ? a.hombres : ''}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${a.mujeres > 0 ? a.mujeres : ''}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${a.lgbti || 0}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${a.total || 0}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${d.hombres > 0 ? d.hombres : ''}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${d.mujeres > 0 ? d.mujeres : ''}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${d.lgbti || 0}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${d.total || 0}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${rowTotal}</td>
                </tr>
            `;
        }).join('');

        const curativasNarrativeHtml = buildCurativasNarrative(data.consolidadoStats?.curativo, data.curativosDiagnoses);

        const procPrev = data.procPreventivos || {};
        const profE = procPrev['PROFILAXIS']?.estudiantes || { hombres: 0, mujeres: 0, lgbti: 0 };
        const profA = procPrev['PROFILAXIS']?.administrativos || { hombres: 0, mujeres: 0, lgbti: 0 };
        const profD = procPrev['PROFILAXIS']?.docentes || { hombres: 0, mujeres: 0, lgbti: 0 };
        const profET = (profE.hombres || 0) + (profE.mujeres || 0) + (profE.lgbti || 0);
        const profAT = (profA.hombres || 0) + (profA.mujeres || 0) + (profA.lgbti || 0);
        const profDT = (profD.hombres || 0) + (profD.mujeres || 0) + (profD.lgbti || 0);
        const profTotal = profET + profAT + profDT;

        const fluoE = procPrev['FLUORIZACIÓN']?.estudiantes || { hombres: 0, mujeres: 0, lgbti: 0 };
        const fluoA = procPrev['FLUORIZACIÓN']?.administrativos || { hombres: 0, mujeres: 0, lgbti: 0 };
        const fluoD = procPrev['FLUORIZACIÓN']?.docentes || { hombres: 0, mujeres: 0, lgbti: 0 };
        const fluoET = (fluoE.hombres || 0) + (fluoE.mujeres || 0) + (fluoE.lgbti || 0);
        const fluoAT = (fluoA.hombres || 0) + (fluoA.mujeres || 0) + (fluoA.lgbti || 0);
        const fluoDT = (fluoD.hombres || 0) + (fluoD.mujeres || 0) + (fluoD.lgbti || 0);
        const fluoTotal = fluoET + fluoAT + fluoDT;

        const totProcH_E = (profE.hombres || 0) + (fluoE.hombres || 0);
        const totProcM_E = (profE.mujeres || 0) + (fluoE.mujeres || 0);
        const totProcL_E = (profE.lgbti || 0) + (fluoE.lgbti || 0);
        const totProcT_E = profET + fluoET;

        const totProcH_A = (profA.hombres || 0) + (fluoA.hombres || 0);
        const totProcM_A = (profA.mujeres || 0) + (fluoA.mujeres || 0);
        const totProcL_A = (profA.lgbti || 0) + (fluoA.lgbti || 0);
        const totProcT_A = profAT + fluoAT;

        const totProcH_D = (profD.hombres || 0) + (fluoD.hombres || 0);
        const totProcM_D = (profD.mujeres || 0) + (fluoD.mujeres || 0);
        const totProcL_D = (profD.lgbti || 0) + (fluoD.lgbti || 0);
        const totProcT_D = profDT + fluoDT;

        const totProcGrand = totProcT_E + totProcT_A + totProcT_D;

        const procPrevNarrativeHtml = buildProcedimientosPreventivosNarrative(data.procPreventivos);

        // Variables para Página 5: Procedimientos de Morbilidad
        const pMor = data.procMorbilidad || {};
        const morbilidadProcs = [
            'DESTARTRAJE',
            'RESTAURACIÓN PROVISIONAL',
            'RESTAURACIÓN CON RESINA',
            'DESGASTE DE PAREDES',
            'EXODONCIA',
            'RECETAS',
            'ORDEN DE RX',
            'RETIRO DE PUNTOS'
        ];

        let totEstMorH = 0, totEstMorM = 0, totEstMorL = 0, totEstMorT = 0;
        let totAdmMorH = 0, totAdmMorM = 0, totAdmMorL = 0, totAdmMorT = 0;
        let totDocMorH = 0, totDocMorM = 0, totDocMorL = 0, totDocMorT = 0;
        let totGrandMorT = 0;

        const morbilidadRowsHtml = morbilidadProcs.map(proc => {
            const est = pMor[proc]?.estudiantes || { hombres: 0, mujeres: 0, lgbti: 0 };
            const adm = pMor[proc]?.administrativos || { hombres: 0, mujeres: 0, lgbti: 0 };
            const doc = pMor[proc]?.docentes || { hombres: 0, mujeres: 0, lgbti: 0 };

            const estH = est.hombres || 0;
            const estM = est.mujeres || 0;
            const estL = est.lgbti || 0;
            const estT = estH + estM + estL;

            const admH = adm.hombres || 0;
            const admM = adm.mujeres || 0;
            const admL = adm.lgbti || 0;
            const admT = admH + admM + admL;

            const docH = doc.hombres || 0;
            const docM = doc.mujeres || 0;
            const docL = doc.lgbti || 0;
            const docT = docH + docM + docL;

            const rowTotal = estT + admT + docT;

            totEstMorH += estH;
            totEstMorM += estM;
            totEstMorL += estL;
            totEstMorT += estT;

            totAdmMorH += admH;
            totAdmMorM += admM;
            totAdmMorL += admL;
            totAdmMorT += admT;

            totDocMorH += docH;
            totDocMorM += docM;
            totDocMorL += docL;
            totDocMorT += docT;

            totGrandMorT += rowTotal;

            return `
                <tr style="font-size: 7px;">
                    <td style="border: 1px solid #000; padding: 1.5px 4px; text-align: left; width: 18%;">${proc}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${estH}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${estM}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 5%;">${estL}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold; background-color: #f2dcdb; width: 6%;">${estT}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${admH}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${admM}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 5%;">${admL}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold; background-color: #f2dcdb; width: 6%;">${admT}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${docH}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${docM}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 5%;">${docL}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold; background-color: #f2dcdb; width: 6%;">${docT}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold; background-color: #f2dcdb; width: 8%;">${rowTotal}</td>
                </tr>
            `;
        }).join('');

        const procMorbilidadNarrativeHtml = buildProcedimientosMorbilidadNarrative(data.procMorbilidad);

        const renderFacultyNarrativeText = (facName, careersObj) => {
            return buildFacultyNarrative(facName, careersObj);
        };

        const renderFacultyTableHtml = (facName, careersObj) => {
            let careers = careersObj;
            if (!careers || Object.keys(careers).length === 0) {
                careers = {};
                (defaultFacultyCareers[facName] || []).forEach(cName => {
                    careers[cName] = { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
                });
            }
            const careerNames = Object.keys(careers);
            if (careerNames.length === 0) return '';

            let facH = 0;
            let facM = 0;
            let facL = 0;
            let facTotal = 0;

            let rowsHtml = '';
            careerNames.forEach((cName, idx) => {
                const s = careers[cName];
                facH += s.hombres || 0;
                facM += s.mujeres || 0;
                facL += s.lgbti || 0;
                facTotal += s.total || 0;

                rowsHtml += `
                    <tr style="font-size: 8px;">
                        ${idx === 0 ? `
                            <td rowspan="${careerNames.length}" style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center; vertical-align: middle; font-weight: bold; background-color: #cbd5e1; width: 26%;">
                                ${facName}
                            </td>
                        ` : ''}
                        <td style="border: 1px solid #4b5563; padding: 2px 6px; text-align: left; width: 38%;">${cName}</td>
                        <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center; width: 9%;">${s.hombres}</td>
                        <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center; width: 9%;">${s.mujeres}</td>
                        <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center; width: 9%;">${s.lgbti}</td>
                        <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center; width: 9%; font-weight: bold;">${s.total}</td>
                    </tr>
                `;
            });

            rowsHtml += `
                <tr style="background-color: #cbd5e1; font-weight: bold; font-size: 8px;">
                    <td colspan="2" style="border: 1px solid #4b5563; padding: 2px 6px; text-align: left;">TOTAL</td>
                    <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${facH}</td>
                    <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${facM}</td>
                    <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${facL}</td>
                    <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${facTotal}</td>
                </tr>
            `;

            return `
                <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1px solid #4b5563; margin-bottom: 5px;">
                    <thead>
                        <tr style="background-color: #cbd5e1; font-weight: bold; font-size: 8px; text-align: center;">
                            <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 26%;">FACULTAD</th>
                            <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 38%;">CARRERA</th>
                            <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 9%;">HOMBRES</th>
                            <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 9%;">MUJERES</th>
                            <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 9%;">LGBTI</th>
                            <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 9%;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            `;
        };

        const renderAnexoTableRowsHtml = () => {
            const anexoFaculties = [
                {
                    faculty: 'CIENCIAS DE LA SALUD',
                    careers: ['Enfermería', 'Gestión de Riesgos', 'Psicología', 'Terapia Física']
                },
                {
                    faculty: 'JURISPRUDENCIA',
                    careers: ['Criminalística', 'Derecho', 'Sociología']
                },
                {
                    faculty: 'CIENCIAS ADMINISTRATIVAS',
                    careers: [
                        'Ad. Empresas',
                        'Comunicación',
                        'Cont. Auditoría',
                        'Emprendimiento e Innovación',
                        'Gestión del Talento Humano',
                        'Marketing Digital',
                        'Mercadotecnia',
                        'Software',
                        'Tecnología de la Informática',
                        'Turismo'
                    ]
                },
                {
                    faculty: 'CIENCIAS AGROPECUARIAS',
                    careers: ['Agroindustria', 'Agronomía', 'Med. Veterinaria']
                },
                {
                    faculty: 'CIENCIAS DE LA EDUCACIÓN',
                    careers: [
                        'Educación Básica',
                        'Educación Inicial',
                        'Educación Intercultural',
                        'Fisicomatemático',
                        'Pedagogía Idiomas Nacionales',
                        'Pedagogía de la Informática',
                        'Centro de Desarrollo Infantil'
                    ]
                }
            ];

            let html = '';
            let isFirstEver = true;

            anexoFaculties.forEach(facGroup => {
                const facName = facGroup.faculty;
                const careers = facGroup.careers;
                const facRowspan = careers.length;

                careers.forEach((careerName, idx) => {
                    const stats = data.statsByFacultyAndCareer?.[facName]?.[careerName] || {
                        hombres: 0,
                        mujeres: 0,
                        lgbti: 0,
                        total: 0
                    };

                    html += '<tr style="font-size: 7.5px;">';

                    if (isFirstEver) {
                        html += `
                            <td rowspan="27" style="border: 1px solid #000; background-color: #d9d9d9; width: 3.5%; text-align: center; vertical-align: middle; font-weight: bold; font-size: 7.5px; line-height: 1.15; padding: 2px 0;">
                                E<br/>S<br/>T<br/>U<br/>D<br/>I<br/>A<br/>N<br/>T<br/>E<br/>S
                            </td>
                        `;
                        isFirstEver = false;
                    }

                    if (idx === 0) {
                        html += `
                            <td rowspan="${facRowspan}" style="border: 1px solid #000; background-color: #d9d9d9; font-weight: bold; text-align: center; vertical-align: middle; padding: 2px 3px; font-size: 7.5px; width: 22%;">
                                ${facName}
                            </td>
                        `;
                    }

                    html += `
                        <td style="border: 1px solid #000; padding: 1.5px 4px; text-align: left; width: 34.5%;">${careerName}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 10%;">${stats.hombres || 0}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 10%;">${stats.mujeres || 0}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 10%;">${stats.lgbti || 0}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 10%; font-weight: bold;">${stats.total || 0}</td>
                    </tr>`;
                });
            });

            // 4 Filas de Resumen
            const estH = data.genderCounts?.estudiantes?.hombres || 0;
            const estM = data.genderCounts?.estudiantes?.mujeres || 0;
            const estL = data.genderCounts?.estudiantes?.lgbti || 0;
            const estT = data.totalEstudiantes || (estH + estM + estL);

            const admH = data.genderCounts?.administrativos?.hombres || 0;
            const admM = data.genderCounts?.administrativos?.mujeres || 0;
            const admL = data.genderCounts?.administrativos?.lgbti || 0;
            const admT = data.totalAdministrativos || (admH + admM + admL);

            const docH = data.genderCounts?.docentes?.hombres || 0;
            const docM = data.genderCounts?.docentes?.mujeres || 0;
            const docL = data.genderCounts?.docentes?.lgbti || 0;
            const docT = data.totalDocentes || (docH + docM + docL);

            const totH = estH + admH + docH;
            const totM = estM + admM + docM;
            const totL = estL + admL + docL;
            const grandTotalAnexo = estT + admT + docT;

            html += `
                <tr style="font-weight: bold; font-size: 7.5px;">
                    <td colspan="3" style="border: 1px solid #000; background-color: #d9d9d9; padding: 2px 4px; text-align: left;">ESTUDIANTES</td>
                    <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${estH}</td>
                    <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${estM}</td>
                    <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${estL}</td>
                    <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${estT}</td>
                </tr>
                <tr style="font-weight: bold; font-size: 7.5px;">
                    <td colspan="3" style="border: 1px solid #000; background-color: #d9d9d9; padding: 2px 4px; text-align: left;">ADMINISTRATIVOS</td>
                    <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${admH}</td>
                    <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${admM}</td>
                    <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${admL}</td>
                    <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${admT}</td>
                </tr>
                <tr style="font-weight: bold; font-size: 7.5px;">
                    <td colspan="3" style="border: 1px solid #000; background-color: #d9d9d9; padding: 2px 4px; text-align: left;">DOCENTES</td>
                    <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${docH}</td>
                    <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${docM}</td>
                    <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${docL}</td>
                    <td style="border: 1px solid #000; padding: 2px; text-align: center; background-color: #fff;">${docT}</td>
                </tr>
                <tr style="font-weight: bold; font-size: 7.5px; background-color: #d9d9d9;">
                    <td colspan="3" style="border: 1px solid #000; padding: 2px 4px; text-align: left;">TOTAL</td>
                    <td style="border: 1px solid #000; padding: 2px; text-align: center;">${totH}</td>
                    <td style="border: 1px solid #000; padding: 2px; text-align: center;">${totM}</td>
                    <td style="border: 1px solid #000; padding: 2px; text-align: center;">${totL}</td>
                    <td style="border: 1px solid #000; padding: 2px; text-align: center;">${grandTotalAnexo}</td>
                </tr>
            `;

            return html;
        };

        const renderAnexo2TableRowsHtml = () => {
            const facConfigs = [
                {
                    shortName: 'F.C. SALUD',
                    fullName: 'CIENCIAS DE LA SALUD',
                    careers: ['Enfermería', 'Gestión de Riesgos', 'Psicología', 'Terapia Física']
                },
                {
                    shortName: 'F.C. JURISPRUDENCIA',
                    fullName: 'JURISPRUDENCIA',
                    careers: ['Criminalística', 'Derecho', 'Sociología']
                },
                {
                    shortName: 'F.C. ADMINISTRATIVAS',
                    fullName: 'CIENCIAS ADMINISTRATIVAS',
                    careers: [
                        'Ad. Empresas',
                        'Comunicación',
                        'Cont. Auditoría',
                        'Emprendimiento e Innovación',
                        'Gestión del Talento Humano',
                        'Marketing Digital',
                        'Mercadotecnia',
                        'Software',
                        'Tecnología de la Informática',
                        'Turismo'
                    ]
                },
                {
                    shortName: 'F.C. AGROPECUARIAS',
                    fullName: 'CIENCIAS AGROPECUARIAS',
                    careers: ['Agroindustria', 'Agronomía', 'Med. Veterinaria']
                },
                {
                    shortName: 'F.C. EDUCACIÓN',
                    fullName: 'CIENCIAS DE LA EDUCACIÓN',
                    careers: [
                        'Educación Básica',
                        'Educación Inicial',
                        'Educación Intercultural Bilingüe',
                        'Fisicomatemático',
                        'Pedagogía Idiomas Nacionales',
                        'Pedagogía de la Informática',
                        'Centro de Desarrollo Infantil'
                    ]
                }
            ];

            let html = '';
            let estPrevH = 0, estPrevM = 0, estPrevL = 0, estPrevT = 0;
            let estCurH = 0, estCurM = 0, estCurL = 0, estCurT = 0;
            let estGrandTotal = 0;

            facConfigs.forEach(cfg => {
                const facShort = cfg.shortName;
                const facFull = cfg.fullName;
                const careers = cfg.careers;
                const facRowspan = careers.length + 1;

                let fPrevH = 0, fPrevM = 0, fPrevL = 0, fPrevT = 0;
                let fCurH = 0, fCurM = 0, fCurL = 0, fCurT = 0;
                let fTotal = 0;

                careers.forEach((careerName, idx) => {
                    const stats = data.statsByFacultyAndCareer?.[facFull]?.[careerName] || {};
                    const p = stats.preventiva || {};
                    const c = stats.curativa || {};

                    const pH = p.hombres || 0;
                    const pM = p.mujeres || 0;
                    const pL = p.lgbti || 0;
                    const pT = p.total || (pH + pM + pL);

                    const cH = c.hombres || 0;
                    const cM = c.mujeres || 0;
                    const cL = c.lgbti || 0;
                    const cT = c.total || (cH + cM + cL);

                    const rowTotal = stats.total || (pT + cT);

                    fPrevH += pH; fPrevM += pM; fPrevL += pL; fPrevT += pT;
                    fCurH += cH; fCurM += cM; fCurL += cL; fCurT += cT;
                    fTotal += rowTotal;

                    estPrevH += pH; estPrevM += pM; estPrevL += pL; estPrevT += pT;
                    estCurH += cH; estCurM += cM; estCurL += cL; estCurT += cT;
                    estGrandTotal += rowTotal;

                    html += '<tr style="font-size: 7px;">';

                    if (idx === 0) {
                        html += `
                            <td rowspan="${facRowspan}" style="border: 1px solid #000; background-color: #fde9d9; font-weight: bold; text-align: center; vertical-align: middle; padding: 2px; width: 14%; color: #000;">
                                ${facShort}
                            </td>
                        `;
                    }

                    html += `
                        <td style="border: 1px solid #000; padding: 1px 3px; text-align: left; width: 24%;">${careerName}</td>
                        <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 6%;">${pH}</td>
                        <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 6%;">${pM}</td>
                        <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 5%;">${pL}</td>
                        <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 7%; background-color: #d8e4bc; font-weight: bold;">${pT}</td>
                        <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 6%;">${cH}</td>
                        <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 6%;">${cM}</td>
                        <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 5%;">${cL}</td>
                        <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 7%; background-color: #d8e4bc; font-weight: bold;">${cT}</td>
                        <td style="border: 1px solid #000; padding: 1px 2px; text-align: center; width: 8%; background-color: #d8e4bc; font-weight: bold;">${rowTotal}</td>
                    </tr>`;
                });

                html += `
                    <tr style="font-weight: bold; font-size: 7px; background-color: #fde9d9;">
                        <td style="border: 1px solid #000; padding: 1.5px 3px; text-align: center;">TOTAL</td>
                        <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${fPrevH}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${fPrevM}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${fPrevL}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${fPrevT}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${fCurH}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${fCurM}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${fCurL}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${fCurT}</td>
                        <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${fTotal}</td>
                    </tr>
                `;
            });

            // Resumen Administrativos
            const admPrev = data.consolidadoStats?.preventivo?.['Examen Odontológico']?.administrativos || {};
            const admPrevH = admPrev.hombres || 0;
            const admPrevM = admPrev.mujeres || 0;
            const admPrevL = admPrev.lgbti || 0;
            const admPrevT = admPrev.total || (admPrevH + admPrevM + admPrevL);

            let admCurH = 0, admCurM = 0, admCurL = 0, admCurT = 0;
            (data.curativosDiagnoses || []).forEach(diag => {
                const r = data.consolidadoStats?.curativo?.[diag]?.administrativos || {};
                admCurH += r.hombres || 0;
                admCurM += r.mujeres || 0;
                admCurL += r.lgbti || 0;
                admCurT += r.total || 0;
            });
            const admTotal = data.totalAdministrativos || (admPrevT + admCurT);

            // Resumen Docentes
            const docPrev = data.consolidadoStats?.preventivo?.['Examen Odontológico']?.docentes || {};
            const docPrevH = docPrev.hombres || 0;
            const docPrevM = docPrev.mujeres || 0;
            const docPrevL = docPrev.lgbti || 0;
            const docPrevT = docPrev.total || (docPrevH + docPrevM + docPrevL);

            let docCurH = 0, docCurM = 0, docCurL = 0, docCurT = 0;
            (data.curativosDiagnoses || []).forEach(diag => {
                const r = data.consolidadoStats?.curativo?.[diag]?.docentes || {};
                docCurH += r.hombres || 0;
                docCurM += r.mujeres || 0;
                docCurL += r.lgbti || 0;
                docCurT += r.total || 0;
            });
            const docTotal = data.totalDocentes || (docPrevT + docCurT);

            // Resumen General
            const grandPrevH = estPrevH + admPrevH + docPrevH;
            const grandPrevM = estPrevM + admPrevM + docPrevM;
            const grandPrevL = estPrevL + admPrevL + docPrevL;
            const grandPrevT = estPrevT + admPrevT + docPrevT;

            const grandCurH = estCurH + admCurH + docCurH;
            const grandCurM = estCurM + admCurM + docCurM;
            const grandCurL = estCurL + admCurL + docCurL;
            const grandCurT = estCurT + admCurT + docCurT;

            const grandTotalAll = data.totalPacientes || (grandPrevT + grandCurT);

            // 4 Filas de Resumen
            html += `
                <tr style="font-weight: bold; font-size: 7px; background-color: #fde9d9;">
                    <td colspan="2" style="border: 1px solid #000; padding: 2px 4px; text-align: left;">ESTUDIANTES</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${estPrevH}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${estPrevM}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${estPrevL}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${estPrevT}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${estCurH}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${estCurM}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${estCurL}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${estCurT}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${estGrandTotal}</td>
                </tr>
                <tr style="font-weight: bold; font-size: 7px; background-color: #fde9d9;">
                    <td colspan="2" style="border: 1px solid #000; padding: 2px 4px; text-align: left;">ADMINISTRATIVOS</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${admPrevH}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${admPrevM}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${admPrevL}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${admPrevT}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${admCurH}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${admCurM}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${admCurL}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${admCurT}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${admTotal}</td>
                </tr>
                <tr style="font-weight: bold; font-size: 7px; background-color: #fde9d9;">
                    <td colspan="2" style="border: 1px solid #000; padding: 2px 4px; text-align: left;">DOCENTES</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${docPrevH}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${docPrevM}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${docPrevL}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${docPrevT}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${docCurH}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${docCurM}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${docCurL}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${docCurT}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${docTotal}</td>
                </tr>
                <tr style="font-weight: bold; font-size: 7px; background-color: #cbd5e1;">
                    <td colspan="2" style="border: 1px solid #000; padding: 2px 4px; text-align: center;">TOTAL</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${grandPrevH}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${grandPrevM}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${grandPrevL}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${grandPrevT}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${grandCurH}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${grandCurM}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${grandCurL}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${grandCurT}</td>
                    <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #d8e4bc;">${grandTotalAll}</td>
                </tr>
            `;

            return html;
        };

        const renderConsolidadoTableHtml = () => {
            const pExamen = data.consolidadoStats?.preventivo?.['Examen Odontológico'] || {
                estudiantes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                administrativos: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                docentes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
            };
            const prevTotal = (pExamen.estudiantes?.total || 0) + (pExamen.administrativos?.total || 0) + (pExamen.docentes?.total || 0);

            let totEstH = pExamen.estudiantes?.hombres || 0;
            let totEstM = pExamen.estudiantes?.mujeres || 0;
            let totEstL = pExamen.estudiantes?.lgbti || 0;
            let totEstT = pExamen.estudiantes?.total || 0;

            let totAdmH = pExamen.administrativos?.hombres || 0;
            let totAdmM = pExamen.administrativos?.mujeres || 0;
            let totAdmL = pExamen.administrativos?.lgbti || 0;
            let totAdmT = pExamen.administrativos?.total || 0;

            let totDocH = pExamen.docentes?.hombres || 0;
            let totDocM = pExamen.docentes?.mujeres || 0;
            let totDocL = pExamen.docentes?.lgbti || 0;
            let totDocT = pExamen.docentes?.total || 0;

            let totGrandT = prevTotal;

            const curRowsHtml = (data.curativosDiagnoses || []).map(diag => {
                const cur = data.consolidadoStats?.curativo?.[diag] || {
                    estudiantes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                    administrativos: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                    docentes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
                };
                const e = cur.estudiantes || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
                const a = cur.administrativos || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
                const d = cur.docentes || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
                const rowTotal = (e.total || 0) + (a.total || 0) + (d.total || 0);

                totEstH += e.hombres || 0; totEstM += e.mujeres || 0; totEstL += e.lgbti || 0; totEstT += e.total || 0;
                totAdmH += a.hombres || 0; totAdmM += a.mujeres || 0; totAdmL += a.lgbti || 0; totAdmT += a.total || 0;
                totDocH += d.hombres || 0; totDocM += d.mujeres || 0; totDocL += d.lgbti || 0; totDocT += d.total || 0;
                totGrandT += rowTotal;

                return `
                    <tr style="font-size: 6.5px;">
                        <td style="border: 1px solid #000; padding: 0.8px 3px; text-align: left;">${diag}</td>
                        <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${e.hombres > 0 ? e.hombres : ''}</td>
                        <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${e.mujeres > 0 ? e.mujeres : ''}</td>
                        <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">0</td>
                        <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${e.total || 0}</td>
                        <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${a.hombres > 0 ? a.hombres : ''}</td>
                        <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${a.mujeres > 0 ? a.mujeres : ''}</td>
                        <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">0</td>
                        <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${a.total || 0}</td>
                        <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${d.hombres > 0 ? d.hombres : ''}</td>
                        <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${d.mujeres > 0 ? d.mujeres : ''}</td>
                        <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">0</td>
                        <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${d.total || 0}</td>
                        <td style="border: 1px solid #000; padding: 0.8px 1px; text-align: center;">${rowTotal || 0}</td>
                    </tr>
                `;
            }).join('');

            return `
                <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1.5px solid #000; font-size: 6.5px; margin-bottom: 2px;">
                    <thead>
                        <tr>
                            <td colspan="2" style="border: 1px solid #000; padding: 2px; text-align: center; vertical-align: middle; background-color: #fff; width: 18%;">
                                <img src="${logoUebTexto}" alt="UEB" style="max-height: 22px; width: auto; object-fit: contain;" />
                            </td>
                            <td colspan="10" style="border: 1px solid #000; padding: 2px; text-align: center; font-weight: bold; font-size: 7.5px; background-color: #fff; line-height: 1.2;">
                                UNIVERSIDAD ESTATAL DE BOLÍVAR<br/>
                                BIENESTAR UNIVERSITARIO<br/>
                                ATENCIONES DE ODONTOLOGÍA - ${selectedMonthText.toUpperCase()} ${genReportYear}
                            </td>
                            <td colspan="2" style="border: 1px solid #000; padding: 2px; text-align: center; vertical-align: middle; background-color: #fff; width: 18%;">
                                <img src="${logoBienestar}" alt="Bienestar Universitario" style="max-height: 22px; width: auto; object-fit: contain;" />
                            </td>
                        </tr>
                        <tr style="font-weight: bold; text-align: center; font-size: 6.5px;">
                            <th style="border: 1px solid #000; background-color: #ebf1de; padding: 2px; text-align: left; width: 22%; color: #000;">CONSOLIDADO</th>
                            <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px; color: #000;">ESTUDIANTES</th>
                            <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px; color: #000;">ADMINISTRATIVOS</th>
                            <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px; color: #000;">DOCENTES</th>
                            <th rowspan="2" style="border: 1px solid #000; background-color: #8db4e2; padding: 2px; color: #000; vertical-align: middle; width: 7%;">TOTAL</th>
                        </tr>
                        <tr style="font-weight: bold; text-align: center; font-size: 6px;">
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 2px; text-align: left; color: #000;">PREVENCION</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5.5%;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5.5%;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5%;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 1px; color: #000; width: 5.5%;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5.5%;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5.5%;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5%;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 1px; color: #000; width: 5.5%;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5.5%;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5.5%;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000; width: 5%;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 1px; color: #000; width: 5.5%;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="font-size: 6.5px;">
                            <td style="border: 1px solid #000; padding: 1px 3px; text-align: left;">Examen Odontológico</td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pExamen.estudiantes?.hombres > 0 ? pExamen.estudiantes?.hombres : ''}</td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pExamen.estudiantes?.mujeres > 0 ? pExamen.estudiantes?.mujeres : ''}</td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;">0</td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pExamen.estudiantes?.total || 0}</td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pExamen.administrativos?.hombres > 0 ? pExamen.administrativos?.hombres : ''}</td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pExamen.administrativos?.mujeres > 0 ? pExamen.administrativos?.mujeres : ''}</td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;">0</td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pExamen.administrativos?.total || 0}</td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pExamen.docentes?.hombres > 0 ? pExamen.docentes?.hombres : ''}</td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pExamen.docentes?.mujeres > 0 ? pExamen.docentes?.mujeres : ''}</td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;">0</td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pExamen.docentes?.total || 0}</td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;">${prevTotal}</td>
                        </tr>
                        <tr style="font-weight: bold; text-align: center; font-size: 6px;">
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 2px; text-align: left; color: #000;">CURATIVO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 1px; color: #000;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 1px; color: #000;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 1px; color: #000;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 1px; color: #000;">TOTAL</th>
                            <th style="border: 1px solid #000; background-color: #8db4e2; padding: 1.5px 1px; color: #000;">TOTAL</th>
                        </tr>
                        ${curRowsHtml}
                        <tr style="font-weight: bold; font-size: 6.5px; background-color: #e4dfec;">
                            <td style="border: 1px solid #000; padding: 1.5px 3px; text-align: center;">TOTAL</td>
                            <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${totEstH}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${totEstM}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">0</td>
                            <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${totEstT}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${totAdmH}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${totAdmM}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">0</td>
                            <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${totAdmT}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${totDocH}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${totDocM}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">0</td>
                            <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${totDocT}</td>
                            <td style="border: 1px solid #000; padding: 1.5px 1px; text-align: center;">${totGrandT}</td>
                        </tr>
                    </tbody>
                </table>
                <div style="display: flex; justify-content: flex-end; margin-bottom: 5px;">
                    <div style="width: 7%; border: 1px solid #000; background-color: #fff; font-size: 6.5px; font-weight: bold; text-align: center; padding: 1px 0;">
                        ${totGrandT}
                    </div>
                </div>
            `;
        };

        const formatCareerDisplayName = (cName) => {
            if (!cName) return '';
            const norm = cName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            if (norm.includes('admin') || norm.includes('empresa')) return 'ADMINISTRACIÓN DE EMPRESAS';
            if (norm.includes('contab') || norm.includes('auditor')) return 'CONTABILIDAD';
            if (norm.includes('veterin')) return 'MEDICINA VETERINARIA';
            return cName.toUpperCase();
        };

        const renderSingleCareerTableHtml = (careerName) => {
            const cStats = data.careerIndividualStats?.[careerName] || {};
            const pVal = cStats.preventivo?.['Examen Odontológico'] || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };

            let curH = 0, curM = 0, curL = 0, curT = 0;
            const careerCurRowsHtml = (data.curativosDiagnoses || []).map(diag => {
                const r = cStats.curativo?.[diag] || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
                curH += r.hombres || 0;
                curM += r.mujeres || 0;
                curL += r.lgbti || 0;
                curT += r.total || 0;

                return `
                    <tr style="font-size: 6.5px;">
                        <td style="border: 1px solid #000; padding: 0.8px 3px; text-align: left;">${diag}</td>
                        <td style="border: 1px solid #000; padding: 0.8px 2px; text-align: center;">${r.hombres > 0 ? r.hombres : ''}</td>
                        <td style="border: 1px solid #000; padding: 0.8px 2px; text-align: center;">${r.mujeres > 0 ? r.mujeres : ''}</td>
                        <td style="border: 1px solid #000; padding: 0.8px 2px; text-align: center;">${r.lgbti > 0 ? r.lgbti : ''}</td>
                        <td style="border: 1px solid #000; padding: 0.8px 2px; text-align: center;">${r.total || 0}</td>
                    </tr>
                `;
            }).join('');

            const cFinalH = (pVal.hombres || 0) + curH;
            const cFinalM = (pVal.mujeres || 0) + curM;
            const cFinalL = (pVal.lgbti || 0) + curL;
            const cFinalT = (pVal.total || 0) + curT;

            return `
                <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1.5px solid #000; font-size: 6.5px; margin-bottom: 2px;">
                    <thead>
                        <tr>
                            <td style="border: 1px solid #000; padding: 2px; text-align: center; vertical-align: middle; background-color: #fff; width: 18%;">
                                <img src="${logoUebTexto}" alt="UEB" style="max-height: 22px; width: auto; object-fit: contain;" />
                            </td>
                            <td colspan="3" style="border: 1px solid #000; padding: 2px; text-align: center; font-weight: bold; font-size: 7.5px; background-color: #fff; line-height: 1.2;">
                                UNIVERSIDAD ESTATAL DE BOLÍVAR<br/>
                                BIENESTAR UNIVERSITARIO<br/>
                                ATENCIONES DE ODONTOLOGÍA - ${selectedMonthText.toUpperCase()} ${genReportYear}
                            </td>
                            <td style="border: 1px solid #000; padding: 2px; text-align: center; vertical-align: middle; background-color: #fff; width: 18%;">
                                <img src="${logoBienestar}" alt="Bienestar Universitario" style="max-height: 22px; width: auto; object-fit: contain;" />
                            </td>
                        </tr>
                        <tr style="font-weight: bold; font-size: 6.5px;">
                            <th style="border: 1px solid #000; background-color: #ebf1de; padding: 2px 4px; text-align: left; color: #000; width: 50%;">
                                ${formatCareerDisplayName(careerName)}
                            </th>
                            <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px; text-align: center; color: #000; width: 50%;">
                                ESTUDIANTES
                            </th>
                        </tr>
                        <tr style="font-weight: bold; font-size: 6px; text-align: center;">
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 3px; text-align: left; color: #000;">PREVENCION</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 2px; color: #000; width: 12.5%;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 2px; color: #000; width: 12.5%;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 2px; color: #000; width: 11%;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000; width: 14%;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="font-size: 6.5px;">
                            <td style="border: 1px solid #000; padding: 1px 3px; text-align: left;">Examen Odontológico</td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pVal.hombres > 0 ? pVal.hombres : ''}</td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pVal.mujeres > 0 ? pVal.mujeres : ''}</td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;"></td>
                            <td style="border: 1px solid #000; padding: 1px; text-align: center;">${pVal.total || 0}</td>
                        </tr>
                        <tr style="font-weight: bold; font-size: 6px; text-align: center;">
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 3px; text-align: left; color: #000;">CURATIVO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 2px; color: #000;">MASCULINO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 2px; color: #000;">FEMENINO</th>
                            <th style="border: 1px solid #000; background-color: #fde9d9; padding: 1.5px 2px; color: #000;">LGBTI</th>
                            <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000;">TOTAL</th>
                        </tr>
                        ${careerCurRowsHtml}
                        <tr style="font-weight: bold; font-size: 6.5px; background-color: #e4dfec;">
                            <td style="border: 1px solid #000; padding: 1.5px 3px; text-align: center;">TOTAL</td>
                            <td style="border: 1px solid #000; padding: 1.5px; text-align: center;">${curH > 0 ? curH : 0}</td>
                            <td style="border: 1px solid #000; padding: 1.5px; text-align: center;">${curM > 0 ? curM : 0}</td>
                            <td style="border: 1px solid #000; padding: 1.5px; text-align: center;">0</td>
                            <td style="border: 1px solid #000; padding: 1.5px; text-align: center;">${curT || 0}</td>
                        </tr>
                    </tbody>
                </table>
                <div style="display: flex; justify-content: flex-end; margin-bottom: 4px;">
                    <div style="width: 14%; border: 1px solid #000; background-color: #fff; font-size: 6.5px; font-weight: bold; text-align: center; padding: 1px 0;">
                        ${cFinalT || 0}
                    </div>
                </div>
            `;
        };

        const renderRemainingCareerPagesHtml = () => '';

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
                        margin: 10mm 12mm 12mm 12mm;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 9.5px;
                        line-height: 1.4;
                        color: #000;
                        margin: 0;
                        padding: 20px 0;
                        background: #e2e8f0;
                    }
                    .page-container {
                        width: 100%;
                        max-width: 210mm;
                        min-height: auto !important;
                        height: auto !important;
                        padding: 12mm 16mm 14mm 16mm;
                        margin: 0 auto 16px auto;
                        background: #fff;
                        box-shadow: 0 4px 14px rgba(0,0,0,0.12);
                        box-sizing: border-box;
                        border-radius: 4px;
                        position: relative;
                    }
                    table, .report-table, .branding-table, .general-data-table {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    tr, tbody {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    thead {
                        display: table-header-group;
                    }
                    .career-card, .table-card, .signature-card, .section-card {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    .page-footer-container {
                        margin-top: 14px;
                        border-top: 1px solid #cbd5e1;
                        padding-top: 4px;
                        font-size: 7.5px;
                        line-height: 1.3;
                        color: #1e3a8a;
                        text-align: left;
                        font-family: Arial, sans-serif;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    @media print {
                        body {
                            background: #fff !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .page-container {
                            width: 100% !important;
                            max-width: 100% !important;
                            min-height: auto !important;
                            height: auto !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            box-shadow: none !important;
                            background: #fff !important;
                            border-radius: 0 !important;
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
                    }
                </style>
            </head>
            <body>
                <!-- CUERPO CONTINUO DEL INFORME: ANTECEDENTES, ACTIVIDADES, RESULTADOS, GÉNERO, FACULTADES, PREVENTIVAS, CURATIVAS, PROCEDIMIENTOS, CONCLUSIONES, RECOMENDACIONES, ANEXOS, FIRMAS -->
                <div class="page-container" style="padding: 12mm 16mm 14mm 16mm; box-sizing: border-box; font-family: Arial, sans-serif;">
                    <!-- Banner Institucional Superior -->
                    <div style="margin-bottom: 12px; text-align: center;">
                        <img src="${headerBienestar}" alt="UEB | Bienestar Universitario" style="width: 100%; max-height: 48px; object-fit: contain;" />
                    </div>

                    <!-- Tabla de Control y Datos Generales -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-family: Arial, sans-serif; border: 1px solid #4b5563;">
                        <!-- Fila 1: Logo UEB | Nombre Institución | Versión y Página -->
                        <tr>
                            <td style="width: 18%; text-align: center; vertical-align: middle; padding: 6px 8px; border: 1px solid #4b5563; background: #fff;">
                                <img src="${logoUebTexto}" alt="UEB" style="max-height: 38px; width: auto; max-width: 95%; object-fit: contain;" />
                            </td>
                            <td colspan="3" style="width: 60%; text-align: center; vertical-align: middle; padding: 6px 8px; border: 1px solid #4b5563; background: #fff;">
                                <div style="font-size: 13px; font-weight: bold; color: #1e3a8a; line-height: 1.2;">Universidad Estatal de Bolívar</div>
                                <div style="font-size: 11px; font-weight: bold; color: #3b82f6; margin-top: 3px;">Informe General</div>
                            </td>
                            <td style="width: 22%; padding: 0; vertical-align: middle; border: 1px solid #4b5563; background: #fff;">
                                <table style="width: 100%; height: 100%; border-collapse: collapse; font-size: 8px;">
                                    <tr>
                                        <td style="width: 50%; border-right: 1px solid #4b5563; border-bottom: 1px solid #4b5563; padding: 4px; font-weight: bold; text-align: center; color: #1e293b;">VERSIÓN:</td>
                                        <td style="width: 50%; border-bottom: 1px solid #4b5563; padding: 4px; text-align: center;">1.0</td>
                                    </tr>
                                    <tr>
                                        <td style="width: 50%; border-right: 1px solid #4b5563; padding: 4px; font-weight: bold; text-align: center; color: #1e293b;">PÁGINA:</td>
                                        <td style="width: 50%; padding: 4px; text-align: center;"><sup>1</sup> de ${totalPages}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Fila 2: DATOS GENERALES -->
                        <tr>
                            <td colspan="5" style="background-color: #cbd5e1; text-align: center; padding: 4px; font-weight: bold; font-size: 10.5px; color: #1e3a8a; border: 1px solid #4b5563; text-transform: uppercase;">
                                DATOS GENERALES
                            </td>
                        </tr>

                        <!-- Fila 3: Fecha de Informe & No. De Informe -->
                        <tr style="font-size: 8.5px;">
                            <td style="background-color: #e2e8f0; border: 1px solid #4b5563; padding: 4px 6px; font-weight: 500; width: 18%;">Fecha de Informe:</td>
                            <td style="border: 1px solid #4b5563; padding: 4px 6px; text-align: center; width: 20%;">${reportDateFormatted}</td>
                            <td style="background-color: #e2e8f0; border: 1px solid #4b5563; padding: 4px 6px; font-weight: 500; width: 15%;">No. De Informe</td>
                            <td colspan="2" style="border: 1px solid #4b5563; padding: 4px 6px; text-align: center; width: 47%;">${reportNo}</td>
                        </tr>

                        <!-- Fila 4: Funcionario Responsable de Informe (Subcabecera Contacto) -->
                        <tr style="font-size: 8.5px; background-color: #e2e8f0;">
                            <td rowspan="3" style="border: 1px solid #4b5563; padding: 4px 6px; vertical-align: middle; font-weight: 500; width: 18%;">Funcionario Responsable de Informe</td>
                            <td rowspan="2" style="border: 1px solid #4b5563; padding: 4px 6px; vertical-align: middle; text-align: left; font-weight: 500; width: 20%;">Nombre</td>
                            <td colspan="2" style="border: 1px solid #4b5563; padding: 3px; text-align: center; font-weight: 500; width: 40%;">Contacto</td>
                            <td rowspan="2" style="border: 1px solid #4b5563; padding: 4px 6px; vertical-align: middle; text-align: left; font-weight: 500; width: 22%;">Cargo</td>
                        </tr>

                        <!-- Fila 5: Extensión Telefónica y Correo Electrónico sub-headers -->
                        <tr style="font-size: 7.5px; background-color: #e2e8f0;">
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: left; font-weight: 500; width: 15%;">Extensión Telefónica</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: left; font-weight: 500; width: 25%;">Correo Electrónico</td>
                        </tr>

                        <!-- Fila 6: Datos del Funcionario -->
                        <tr style="font-size: 8px;">
                            <td style="border: 1px solid #4b5563; padding: 5px; text-align: left;">${doctorNameText}</td>
                            <td style="border: 1px solid #4b5563; padding: 5px; text-align: center;">167 &nbsp; 168 &nbsp; 169</td>
                            <td style="border: 1px solid #4b5563; padding: 5px; text-align: left;">${doctorEmail}</td>
                            <td style="border: 1px solid #4b5563; padding: 5px; text-align: left;">Odontóloga de Bienestar Universitario</td>
                        </tr>

                        <!-- Fila 7: Informe dirigido a: (Subcabecera Contacto) -->
                        <tr style="font-size: 8.5px; background-color: #e2e8f0;">
                            <td rowspan="3" style="border: 1px solid #4b5563; padding: 4px 6px; vertical-align: middle; font-weight: 500; width: 18%;">Informe dirigido a:</td>
                            <td rowspan="2" style="border: 1px solid #4b5563; padding: 4px 6px; vertical-align: middle; text-align: left; font-weight: 500; width: 20%;">Nombre</td>
                            <td colspan="2" style="border: 1px solid #4b5563; padding: 3px; text-align: center; font-weight: 500; width: 40%;">Contacto</td>
                            <td rowspan="2" style="border: 1px solid #4b5563; padding: 4px 6px; vertical-align: middle; text-align: left; font-weight: 500; width: 22%;">Cargo</td>
                        </tr>

                        <!-- Fila 8: Extensión Telefónica y Correo Electrónico sub-headers -->
                        <tr style="font-size: 7.5px; background-color: #e2e8f0;">
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: left; font-weight: 500; width: 15%;">Extensión Telefónica</td>
                            <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: left; font-weight: 500; width: 25%;">Correo Electrónico</td>
                        </tr>

                        <!-- Fila 9: Datos del Destinatario -->
                        <tr style="font-size: 8px;">
                            <td style="border: 1px solid #4b5563; padding: 5px; text-align: left;">Michel Gaibor Vásquez</td>
                            <td style="border: 1px solid #4b5563; padding: 5px; text-align: center;">167 &nbsp; 168 &nbsp; 169</td>
                            <td style="border: 1px solid #4b5563; padding: 5px; text-align: left;">sgaibor@ueb.gob.ec</td>
                            <td style="border: 1px solid #4b5563; padding: 5px; text-align: left;">Coordinadora de Bienestar Universitario</td>
                        </tr>

                        <!-- Fila 10: ASUNTO -->
                        <tr>
                            <td colspan="5" style="background-color: #eee9f6; border: 1px solid #4b5563; padding: 5px 8px; font-size: 8.5px; text-align: left;">
                                <strong>ASUNTO:</strong> Informe mensual de atenciones odontológicas del mes de ${selectedMonthText.toLowerCase()}.
                            </td>
                        </tr>
                    </table>

                    <!-- Sección 1: ANTECEDENTES -->
                    <div style="font-size: 10px; font-weight: bold; margin-top: 14px; margin-bottom: 6px; text-transform: uppercase; color: #000;">
                        1. ANTECEDENTES
                    </div>
                    <p style="font-size: 8.5px; line-height: 1.4; text-align: justify; margin-bottom: 8px; color: #000;">
                        Bienestar Universitario, fue creado mediante resolución del Honorable Consejo Estudiantil en el año 1990 en conjunto con los demás departamentos que conforman la estructura administrativa de la institución. Dentro de su organización interna, se la concibió como un departamento de atención médica, odontológica, psicológica y servicio social dirigido a los miembros de la comunidad universitaria.
                    </p>
                    <p style="font-size: 8.5px; line-height: 1.4; text-align: justify; margin-bottom: 12px; color: #000;">
                        Bienestar Universitario, a través del área de odontología brinda atención diaria a la comunidad universitaria, conformada por estudiantes, docentes y personal administrativo, asegurando la prestación continua y eficiente en la atención preventiva y curativa a los usuarios.
                    </p>

                    <!-- Sección 2: ACTIVIDADES -->
                    <div style="font-size: 10px; font-weight: bold; margin-top: 14px; margin-bottom: 6px; text-transform: uppercase; color: #000;">
                        2. ACTIVIDADES
                    </div>
                    <div style="font-size: 8.5px; line-height: 1.45; color: #000; margin-bottom: 14px; padding-left: 5px;">
                        <div>• Promoción de la salud buco-dental</div>
                        <div>• Atención Preventiva.</div>
                        <div>• Atención Curativa o Morbilidad.</div>
                        <div>• Tratamiento y procedimientos oportuno</div>
                        <div>• Elaboración de Historia Clínica Odontológica a los pacientes.</div>
                        <div>• Registro de atenciones.</div>
                        <div>• Elaboración del informe mensual de actividades.</div>
                    </div>

                    <!-- Sección 3: ANÁLISIS DE RESULTADOS -->
                    <div style="font-size: 10px; font-weight: bold; margin-top: 14px; margin-bottom: 8px; text-transform: uppercase; color: #000;">
                        3. ANÁLISIS DE RESULTADOS
                    </div>
                    <table style="width: 250px; border-collapse: collapse; margin-left: 140px; margin-bottom: 15px; border: 1px solid #4b5563; font-family: Arial, sans-serif;">
                        <thead>
                            <tr style="background-color: #cbd5e1; font-size: 8.5px; font-weight: bold;">
                                <th style="border: 1px solid #4b5563; padding: 4px 8px; text-align: left; width: 65%;">COMUNIDAD UNIVERSITARIA</th>
                                <th style="border: 1px solid #4b5563; padding: 4px 8px; text-align: center; width: 35%;">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody style="font-size: 8.5px;">
                            <tr>
                                <td style="border: 1px solid #4b5563; padding: 3px 8px; text-align: left;">ESTUDIANTES</td>
                                <td style="border: 1px solid #4b5563; padding: 3px 8px; text-align: center;">${data.totalEstudiantes}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #4b5563; padding: 3px 8px; text-align: left;">ADMINISTRATIVOS</td>
                                <td style="border: 1px solid #4b5563; padding: 3px 8px; text-align: center;">${data.totalAdministrativos}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #4b5563; padding: 3px 8px; text-align: left;">DOCENTES</td>
                                <td style="border: 1px solid #4b5563; padding: 3px 8px; text-align: center;">${data.totalDocentes}</td>
                            </tr>
                            <tr style="background-color: #cbd5e1; font-weight: bold;">
                                <td style="border: 1px solid #4b5563; padding: 3px 8px; text-align: left;">TOTAL</td>
                                <td style="border: 1px solid #4b5563; padding: 3px 8px; text-align: center;">${data.totalPacientes}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Párrafo introductorio -->
                    <p style="font-size: 8.5px; line-height: 1.35; text-align: justify; margin: 0 0 8px 0; color: #1e293b;">
                        Las actividades realizadas durante el mes de ${selectedMonthText.toLowerCase()} en las atenciones odontológicas a la Comunidad Universitaria dan un total de ${data.totalPacientes} pacientes, ${data.totalEstudiantes} estudiantes, ${data.totalAdministrativos} Administrativos y ${data.totalDocentes} Docentes.
                    </p>

                    <!-- DATOS POR GÉNERO -->
                    <div style="font-weight: bold; font-size: 9px; margin-top: 10px; margin-bottom: 5px; color: #000;">
                        DATOS POR GÉNERO:
                    </div>

                    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1px solid #4b5563; margin-bottom: 6px;">
                        <thead>
                            <tr style="background-color: #cbd5e1; font-weight: bold; font-size: 8px; text-align: center;">
                                <th style="border: 1px solid #4b5563; padding: 2px 6px; text-align: left; width: 40%;">COMUNIDAD UNIVERSITARIA</th>
                                <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 15%;">HOMBRES</th>
                                <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 15%;">MUJERES</th>
                                <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 15%;">LGBTI</th>
                                <th style="border: 1px solid #4b5563; padding: 2px 4px; width: 15%;">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="font-size: 8px;">
                                <td style="border: 1px solid #4b5563; padding: 2px 6px; text-align: left;">ESTUDIANTES</td>
                                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${data.genderCounts?.estudiantes?.hombres || 0}</td>
                                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${data.genderCounts?.estudiantes?.mujeres || 0}</td>
                                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${data.genderCounts?.estudiantes?.lgbti || 0}</td>
                                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center; font-weight: bold;">${data.totalEstudiantes || 0}</td>
                            </tr>
                            <tr style="font-size: 8px;">
                                <td style="border: 1px solid #4b5563; padding: 2px 6px; text-align: left;">ADMINISTRATIVOS</td>
                                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${data.genderCounts?.administrativos?.hombres || 0}</td>
                                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${data.genderCounts?.administrativos?.mujeres || 0}</td>
                                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${data.genderCounts?.administrativos?.lgbti || 0}</td>
                                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center; font-weight: bold;">${data.totalAdministrativos || 0}</td>
                            </tr>
                            <tr style="font-size: 8px;">
                                <td style="border: 1px solid #4b5563; padding: 2px 6px; text-align: left;">DOCENTES</td>
                                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${data.genderCounts?.docentes?.hombres || 0}</td>
                                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${data.genderCounts?.docentes?.mujeres || 0}</td>
                                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${data.genderCounts?.docentes?.lgbti || 0}</td>
                                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center; font-weight: bold;">${data.totalDocentes || 0}</td>
                            </tr>
                            <tr style="background-color: #cbd5e1; font-weight: bold; font-size: 8px;">
                                <td style="border: 1px solid #4b5563; padding: 2px 6px; text-align: left;">TOTAL</td>
                                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${totalH}</td>
                                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${totalM}</td>
                                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${totalL}</td>
                                <td style="border: 1px solid #4b5563; padding: 2px 4px; text-align: center;">${data.totalPacientes || 0}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Narrativa Género -->
                    <p style="font-size: 8.5px; line-height: 1.35; text-align: justify; margin: 0 0 10px 0; color: #1e293b;">
                        ${genderNarrative}
                    </p>

                    <!-- POR FACULTADES -->
                    <div style="font-weight: bold; font-size: 9px; margin-top: 10px; margin-bottom: 5px; color: #000;">
                        POR FACULTADES:
                    </div>

                    <!-- Facultad 1: CIENCIAS DE LA SALUD -->
                    ${renderFacultyTableHtml('CIENCIAS DE LA SALUD', data.statsByFacultyAndCareer?.['CIENCIAS DE LA SALUD'] || {})}
                    <p style="font-size: 8px; line-height: 1.35; text-align: justify; margin: 0 0 6px 0; color: #1e293b;">
                        ${renderFacultyNarrativeText('CIENCIAS DE LA SALUD', data.statsByFacultyAndCareer?.['CIENCIAS DE LA SALUD'] || {})}
                    </p>

                    <!-- Facultad 2: JURISPRUDENCIA -->
                    ${renderFacultyTableHtml('JURISPRUDENCIA', data.statsByFacultyAndCareer?.['JURISPRUDENCIA'] || {})}
                    <p style="font-size: 8px; line-height: 1.35; text-align: justify; margin: 0 0 6px 0; color: #1e293b;">
                        ${renderFacultyNarrativeText('JURISPRUDENCIA', data.statsByFacultyAndCareer?.['JURISPRUDENCIA'] || {})}
                    </p>

                    <!-- Facultad 3: CIENCIAS ADMINISTRATIVAS -->
                    ${renderFacultyTableHtml('CIENCIAS ADMINISTRATIVAS', data.statsByFacultyAndCareer?.['CIENCIAS ADMINISTRATIVAS'] || {})}
                    <p style="font-size: 8px; line-height: 1.35; text-align: justify; margin: 0 0 6px 0; color: #1e293b;">
                        ${renderFacultyNarrativeText('CIENCIAS ADMINISTRATIVAS', data.statsByFacultyAndCareer?.['CIENCIAS ADMINISTRATIVAS'] || {})}
                    </p>

                    <!-- Facultad 4: CIENCIAS AGROPECUARIAS -->
                    ${renderFacultyTableHtml('CIENCIAS AGROPECUARIAS', data.statsByFacultyAndCareer?.['CIENCIAS AGROPECUARIAS'] || {})}
                    <p style="font-size: 8px; line-height: 1.35; text-align: justify; margin: 0 0 6px 0; color: #1e293b;">
                        ${renderFacultyNarrativeText('CIENCIAS AGROPECUARIAS', data.statsByFacultyAndCareer?.['CIENCIAS AGROPECUARIAS'] || {})}
                    </p>

                    <!-- Facultad 5: CIENCIAS DE LA EDUCACIÓN -->
                    ${renderFacultyTableHtml('CIENCIAS DE LA EDUCACIÓN', data.statsByFacultyAndCareer?.['CIENCIAS DE LA EDUCACIÓN'] || {})}
                    <p style="font-size: 8px; line-height: 1.35; text-align: justify; margin: 0 0 10px 0; color: #1e293b;">
                        ${renderFacultyNarrativeText('CIENCIAS DE LA EDUCACIÓN', data.statsByFacultyAndCareer?.['CIENCIAS DE LA EDUCACIÓN'] || {})}
                    </p>

                    <!-- Sección ATENCIONES PREVENTIVAS -->
                    <div style="font-weight: bold; font-size: 9px; margin-top: 12px; margin-bottom: 6px; color: #000; text-transform: uppercase;">
                        ATENCIONES PREVENTIVAS
                    </div>

                    <!-- Tabla ATENCIONES PREVENTIVAS -->
                    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1px solid #000; margin-bottom: 6px; font-size: 7.5px;">
                        <thead>
                            <tr style="font-weight: bold; text-align: center;">
                                <th style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 16%; color: #000;">COMUNIDAD<br/>UNIVERSITARIA</th>
                                <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 25%; color: #000;">ESTUDIANTES</th>
                                <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 25%; color: #000;">ADMINISTRATIVOS</th>
                                <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 25%; color: #000;">DOCENTES</th>
                                <th style="border: 1px solid #000; background-color: #8db4e2; padding: 2px 4px; width: 9%; color: #000;">TOTAL</th>
                            </tr>
                            <tr style="font-weight: bold; text-align: center; font-size: 7px;">
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 4px; color: #000;">PREVENCIÓN</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">MASCULINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">FEMENINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">LGBTI</th>
                                <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 2px 2px; color: #000;">TOTAL</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">MASCULINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">FEMENINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">LGBTI</th>
                                <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 2px 2px; color: #000;">TOTAL</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">MASCULINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">FEMENINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 2px; color: #000;">LGBTI</th>
                                <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 2px 2px; color: #000;">TOTAL</th>
                                <th style="border: 1px solid #000; background-color: #8db4e2; padding: 2px 2px; color: #000;">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="font-size: 7.5px;">
                                <td style="border: 1px solid #000; padding: 2px 4px; text-align: left;">Examen<br/>Odontológico</td>
                                <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${prevExamen.estudiantes?.hombres || 0}</td>
                                <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${prevExamen.estudiantes?.mujeres || 0}</td>
                                <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${prevExamen.estudiantes?.lgbti || 0}</td>
                                <td style="border: 1px solid #000; padding: 2px 2px; text-align: center; font-weight: bold;">${prevExamen.estudiantes?.total || 0}</td>
                                <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${prevExamen.administrativos?.hombres || 0}</td>
                                <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${prevExamen.administrativos?.mujeres || 0}</td>
                                <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${prevExamen.administrativos?.lgbti || 0}</td>
                                <td style="border: 1px solid #000; padding: 2px 2px; text-align: center; font-weight: bold;">${prevExamen.administrativos?.total || 0}</td>
                                <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${prevExamen.docentes?.hombres || 0}</td>
                                <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${prevExamen.docentes?.mujeres || 0}</td>
                                <td style="border: 1px solid #000; padding: 2px 2px; text-align: center;">${prevExamen.docentes?.lgbti || 0}</td>
                                <td style="border: 1px solid #000; padding: 2px 2px; text-align: center; font-weight: bold;">${prevExamen.docentes?.total || 0}</td>
                                <td style="border: 1px solid #000; padding: 2px 2px; text-align: center; font-weight: bold;">${prevTotal}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Narrativa ATENCIONES PREVENTIVAS -->
                    <p style="font-size: 8px; line-height: 1.35; margin: 4px 0 10px 0; color: #000;">
                        ${preventivasNarrative}
                    </p>

                    <!-- Sección ATENCIONES CURATIVAS (TABLA COMPLETA UNIFICADA) -->
                    <div style="font-weight: bold; font-size: 9px; margin-top: 12px; margin-bottom: 6px; color: #000; text-transform: uppercase;">
                        ATENCIONES CURATIVAS
                    </div>

                    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1px solid #000; margin-bottom: 6px; font-size: 7px;">
                        <thead>
                            <tr style="font-weight: bold; text-align: center;">
                                <th style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 18%; color: #000;">COMUNIDAD<br/>UNIVERSITARIA</th>
                                <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">ESTUDIANTES</th>
                                <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">ADMINISTRATIVOS</th>
                                <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">DOCENTES</th>
                                <th style="border: 1px solid #000; background-color: #8db4e2; padding: 2px 4px; width: 8%; color: #000;">TOTAL</th>
                            </tr>
                            <tr style="font-weight: bold; text-align: center; font-size: 7px;">
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 2px 4px; color: #000; text-align: left; width: 18%;">CURATIVO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 6%;">MASCULINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 6%;">FEMENINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 5%;">LGBTI</th>
                                <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000; width: 6%;">TOTAL</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 6%;">MASCULINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 6%;">FEMENINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 5%;">LGBTI</th>
                                <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000; width: 6%;">TOTAL</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 6%;">MASCULINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 6%;">FEMENINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000; width: 5%;">LGBTI</th>
                                <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000; width: 6%;">TOTAL</th>
                                <th style="border: 1px solid #000; background-color: #8db4e2; padding: 1.5px 2px; color: #000; width: 8%;">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${curativosRowsHtml}
                            <tr style="background-color: #cbd5e1; font-weight: bold; font-size: 7px;">
                                <td style="border: 1px solid #000; padding: 2px 4px; text-align: left;">TOTAL</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totEstCurH}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totEstCurM}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totEstCurL}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totEstCurT}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totAdmCurH}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totAdmCurM}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totAdmCurL}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totAdmCurT}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totDocCurH}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totDocCurM}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totDocCurL}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totDocCurT}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totGrandCurT}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Narrativa ATENCIONES CURATIVAS -->
                    <div style="font-size: 8px; line-height: 1.35; margin: 4px 0 10px 0; color: #000; text-align: justify;">
                        ${curativasNarrativeHtml}
                    </div>

                    <!-- Sección PROCEDIMIENTOS PREVENTIVOS -->
                    <div style="font-weight: bold; font-size: 9px; margin-top: 12px; margin-bottom: 5px; color: #000; text-transform: uppercase;">
                        PROCEDIMIENTOS PREVENTIVOS
                    </div>

                    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1px solid #000; margin-bottom: 5px; font-size: 7px;">
                        <thead>
                            <tr style="font-weight: bold; text-align: center;">
                                <th style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 18%; color: #000; text-align: left;">PROCEDIMIENTOS</th>
                                <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">ESTUDIANTES</th>
                                <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">ADMINISTRATIVOS</th>
                                <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">DOCENTES</th>
                                <th style="border: 1px solid #000; background-color: #8db4e2; padding: 2px 4px; width: 8%; color: #000;">TOTAL</th>
                            </tr>
                            <tr style="font-weight: bold; text-align: center;">
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 4px; color: #000; text-align: left;">PREVENCIÓN</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">MASCULINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">FEMENINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">LGBTI</th>
                                <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000;">TOTAL</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">MASCULINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">FEMENINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">LGBTI</th>
                                <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000;">TOTAL</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">MASCULINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">FEMENINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">LGBTI</th>
                                <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000;">TOTAL</th>
                                <th style="border: 1px solid #000; background-color: #8db4e2; padding: 1.5px 2px; color: #000;">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border: 1px solid #000; padding: 1.5px 4px; text-align: left;">PROFILAXIS</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${profE.hombres || ''}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${profE.mujeres || ''}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${profE.lgbti || 0}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${profET}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${profA.hombres || ''}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${profA.mujeres || ''}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${profA.lgbti || 0}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${profAT}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${profD.hombres || ''}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${profD.mujeres || ''}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${profD.lgbti || 0}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${profDT}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${profTotal}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #000; padding: 1.5px 4px; text-align: left;">FLUORIZACIÓN</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${fluoE.hombres || ''}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${fluoE.mujeres || ''}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${fluoE.lgbti || 0}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${fluoET}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${fluoA.hombres || ''}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${fluoA.mujeres || ''}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${fluoA.lgbti || 0}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${fluoAT}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${fluoD.hombres || ''}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${fluoD.mujeres || ''}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${fluoD.lgbti || 0}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${fluoDT}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; font-weight: bold;">${fluoTotal}</td>
                            </tr>
                            <tr style="background-color: #cbd5e1; font-weight: bold; font-size: 7px;">
                                <td style="border: 1px solid #000; padding: 1.5px 4px; text-align: left;">TOTAL</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totProcH_E}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totProcM_E}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totProcL_E}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totProcT_E}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totProcH_A}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totProcM_A}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totProcL_A}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totProcT_A}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totProcH_D}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totProcM_D}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totProcL_D}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totProcT_D}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center;">${totProcGrand}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Narrativa PROCEDIMIENTOS PREVENTIVOS -->
                    <div style="font-size: 8px; line-height: 1.35; margin: 4px 0 10px 0; color: #000; text-align: justify;">
                        ${procPrevNarrativeHtml}
                    </div>

                    <!-- Sección PROCEDIMIENTOS DE MORBILIDAD (TABLA COMPLETA UNIFICADA) -->
                    <div style="font-weight: bold; font-size: 9px; margin-top: 12px; margin-bottom: 5px; color: #000; text-transform: uppercase;">
                        PROCEDIMIENTOS DE MORBILIDAD
                    </div>

                    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1px solid #000; margin-bottom: 6px; font-size: 7px;">
                        <thead>
                            <tr style="font-weight: bold; text-align: center;">
                                <th style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 18%; color: #000; text-align: left;">PROCEDIMIENTOS</th>
                                <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">ESTUDIANTES</th>
                                <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">ADMINISTRATIVOS</th>
                                <th colspan="4" style="border: 1px solid #000; background-color: #fde9d9; padding: 2px 4px; width: 23%; color: #000;">DOCENTES</th>
                                <th style="border: 1px solid #000; background-color: #8db4e2; padding: 2px 4px; width: 8%; color: #000;">TOTAL</th>
                            </tr>
                            <tr style="font-weight: bold; text-align: center;">
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 4px; color: #000; text-align: left;">MORBILIDAD</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">MASCULINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">FEMENINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">LGBTI</th>
                                <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000;">TOTAL</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">MASCULINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">FEMENINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">LGBTI</th>
                                <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000;">TOTAL</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">MASCULINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">FEMENINO</th>
                                <th style="border: 1px solid #000; background-color: #fcd5b4; padding: 1.5px 2px; color: #000;">LGBTI</th>
                                <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000;">TOTAL</th>
                                <th style="border: 1px solid #000; background-color: #8db4e2; padding: 1.5px 2px; color: #000;">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${morbilidadRowsHtml}
                            <tr style="font-weight: bold; font-size: 7px;">
                                <td style="border: 1px solid #000; padding: 2px 4px; text-align: left; width: 18%;">TOTAL</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${totEstMorH}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${totEstMorM}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 5%;">${totEstMorL}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #f2dcdb; width: 6%;">${totEstMorT}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${totAdmMorH}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${totAdmMorM}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 5%;">${totAdmMorL}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #f2dcdb; width: 6%;">${totAdmMorT}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${totDocMorH}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 6%;">${totDocMorM}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; width: 5%;">${totDocMorL}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #f2dcdb; width: 6%;">${totDocMorT}</td>
                                <td style="border: 1px solid #000; padding: 1.5px 2px; text-align: center; background-color: #f2dcdb; width: 8%;">${totGrandMorT}</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Narrativa PROCEDIMIENTOS DE MORBILIDAD -->
                    <div style="font-size: 8px; line-height: 1.35; margin: 6px 0 14px 0; color: #000; text-align: justify;">
                        ${procMorbilidadNarrativeHtml}
                    </div>

                    <!-- 4. CONCLUSIONES -->
                    <div style="font-weight: bold; font-size: 9px; margin-top: 14px; margin-bottom: 6px; text-transform: uppercase; color: #000;">
                        4. CONCLUSIONES
                    </div>
                    <p style="font-size: 8.5px; line-height: 1.4; text-align: justify; margin: 0 0 14px 0; color: #000;">
                        El Servicio de Odontología contribuye a garantizar la salud Buco-Dental de los miembros de la comunidad universitaria, lograr disminuir las patologías bucales con las atenciones preventivas, curativas, campañas de prevención y socialización que realizamos con las distintas carreras de nuestra universidad.
                    </p>

                    <!-- 5. RECOMENDACIONES -->
                    <div style="font-weight: bold; font-size: 9px; margin-top: 14px; margin-bottom: 6px; text-transform: uppercase; color: #000;">
                        5. RECOMENDACIONES
                    </div>
                    <p style="font-size: 8.5px; line-height: 1.4; text-align: justify; margin: 0 0 4px 0; color: #000;">
                        Fortalecer el Servicio de Odontológico de Bienestar Universitario con la compra oportuna de los insumos e instrumentos odontológicos solicitados por el área de odontología.
                    </p>
                    <p style="font-size: 8.5px; line-height: 1.4; text-align: justify; margin: 0 0 14px 0; color: #000;">
                        Actualizar información de los servicios que brinda Bienestar Universitario en la página web de la Universidad Estatal de Bolívar.
                    </p>

                    <!-- 6. ANEXOS -->
                    <div style="font-weight: bold; font-size: 9.5px; margin-top: 18px; margin-bottom: 8px; text-transform: uppercase; color: #000; border-bottom: 1.5px solid #000; padding-bottom: 2px;">
                        6. ANEXOS
                    </div>

                    <!-- TABLA GENERAL DE ATENCIONES (ANEXO 1) -->
                    <div class="table-card" style="page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 14px;">
                        <div style="font-weight: bold; font-size: 9px; text-align: center; margin-bottom: 6px; color: #000; text-transform: uppercase;">
                            ATENCIONES DE ODONTOLOGÍA - ${selectedMonthText.toUpperCase()} ${genReportYear}
                        </div>
                        <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1.5px solid #000; font-size: 7.5px; margin-bottom: 4px;">
                            <thead>
                                <tr style="font-weight: bold; text-align: center; background-color: #d9d9d9;">
                                    <th colspan="2" style="border: 1px solid #000; padding: 2.5px 2px; width: 25.5%; color: #000;">FACULTAD</th>
                                    <th style="border: 1px solid #000; padding: 2.5px 2px; width: 34.5%; color: #000;">CARRERA</th>
                                    <th style="border: 1px solid #000; padding: 2.5px 2px; width: 10%; color: #000;">HOMBRES</th>
                                    <th style="border: 1px solid #000; padding: 2.5px 2px; width: 10%; color: #000;">MUJERES</th>
                                    <th style="border: 1px solid #000; padding: 2.5px 2px; width: 10%; color: #000;">LGBTI</th>
                                    <th style="border: 1px solid #000; padding: 2.5px 2px; width: 10%; color: #000;">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${renderAnexoTableRowsHtml()}
                            </tbody>
                        </table>
                    </div>

                    <!-- TABLA PREVENTIVA VS CURATIVA (ANEXO 2) -->
                    <div class="table-card" style="page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 14px;">
                        <div style="font-weight: bold; font-size: 9px; text-align: center; margin-bottom: 6px; color: #000; text-transform: uppercase;">
                            ATENCIONES DE ODONTOLOGÍA - ${selectedMonthText.toUpperCase()} ${genReportYear}
                        </div>
                        <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border: 1.5px solid #000; font-size: 7px; margin-bottom: 4px;">
                            <thead>
                                <tr style="font-weight: bold; text-align: center;">
                                    <th colspan="2" style="border: 1px solid #000; background-color: #8db4e2; padding: 2px; color: #000; width: 38%;">COMUNIDAD UNIVERSITARIA</th>
                                    <th colspan="4" style="border: 1px solid #000; background-color: #8db4e2; padding: 2px; color: #000; width: 24%;">ODONTOLOGÍA PREVENTIVA</th>
                                    <th colspan="4" style="border: 1px solid #000; background-color: #8db4e2; padding: 2px; color: #000; width: 24%;">ODONTOLOGÍA CURATIVA</th>
                                    <th rowspan="2" style="border: 1px solid #000; background-color: #d8e4bc; padding: 2px; color: #000; width: 8%; vertical-align: middle;">TOTAL</th>
                                </tr>
                                <tr style="font-weight: bold; text-align: center; background-color: #fde9d9;">
                                    <th style="border: 1px solid #000; padding: 1.5px 2px; color: #000; width: 14%;">FACULTAD</th>
                                    <th style="border: 1px solid #000; padding: 1.5px 2px; color: #000; width: 24%;">CARRERA</th>
                                    <th style="border: 1px solid #000; padding: 1.5px 2px; color: #000; width: 6%;">MASCULINO</th>
                                    <th style="border: 1px solid #000; padding: 1.5px 2px; color: #000; width: 6%;">FEMENINO</th>
                                    <th style="border: 1px solid #000; padding: 1.5px 2px; color: #000; width: 5%;">LGBTI</th>
                                    <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000; width: 7%;">TOTAL</th>
                                    <th style="border: 1px solid #000; padding: 1.5px 2px; color: #000; width: 6%;">MASCULINO</th>
                                    <th style="border: 1px solid #000; padding: 1.5px 2px; color: #000; width: 6%;">FEMENINO</th>
                                    <th style="border: 1px solid #000; padding: 1.5px 2px; color: #000; width: 5%;">LGBTI</th>
                                    <th style="border: 1px solid #000; background-color: #d8e4bc; padding: 1.5px 2px; color: #000; width: 7%;">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${renderAnexo2TableRowsHtml()}
                            </tbody>
                        </table>
                    </div>

                    <!-- TABLA CONSOLIDADO -->
                    <div class="table-card" style="page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 14px;">
                        ${renderConsolidadoTableHtml()}
                    </div>

                    <!-- TABLAS INDIVIDUALES POR CARRERA -->
                    ${(activeCareers && activeCareers.length > 0) ? activeCareers.map(cName => `
                        <div class="career-card" style="page-break-inside: avoid !important; break-inside: avoid !important; margin-bottom: 10px;">
                            ${renderSingleCareerTableHtml(cName)}
                        </div>
                    `).join('') : `
                        <div style="text-align: center; color: #64748b; font-style: italic; font-size: 8px; margin: 15px 0;">
                            No se registraron atenciones a estudiantes de carreras específicas este mes.
                        </div>
                    `}

                    <!-- LEGALIZACIÓN Y FIRMAS -->
                    <div class="signature-card" style="page-break-inside: avoid !important; break-inside: avoid !important; margin-top: 18px; margin-bottom: 14px;">
                        <div style="font-size: 8.5px; font-family: Arial, sans-serif; margin-bottom: 8px; color: #000; text-align: left;">
                            Adjunto ${data.totalFojas || 18} fojas, copias a color partes diarios.
                        </div>

                        <table style="width: 85%; border-collapse: collapse; margin-top: 6px; border: 1px solid #000; font-family: Arial, sans-serif; font-size: 7.5px;">
                            <thead>
                                <tr style="background-color: #e4dfec; font-weight: bold;">
                                    <td style="border: 1px solid #000; padding: 4px 6px; text-align: center; width: 22%; font-weight: bold; color: #000;">Datos</td>
                                    <td style="border: 1px solid #000; padding: 4px 6px; text-align: center; width: 39%; font-weight: bold; color: #000;">Elaborado por:</td>
                                    <td style="border: 1px solid #000; padding: 4px 6px; text-align: center; width: 39%; font-weight: bold; color: #000;">Revisado y Aprobado por:</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="border: 1px solid #000; padding: 4px 6px; text-align: left; font-weight: bold; background-color: #e4dfec; height: 50px; vertical-align: top; color: #000;">Firmas</td>
                                    <td style="border: 1px solid #000; padding: 4px 6px; text-align: center; height: 50px; background-color: #fff;"></td>
                                    <td style="border: 1px solid #000; padding: 4px 6px; text-align: center; height: 50px; background-color: #fff;"></td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #000; padding: 3px 6px; text-align: left; font-weight: bold; background-color: #e4dfec; color: #000;">Nombre y Apellido</td>
                                    <td style="border: 1px solid #000; padding: 3px 6px; text-align: center; color: #000; background-color: #fff;">${doctorNameText}</td>
                                    <td style="border: 1px solid #000; padding: 3px 6px; text-align: center; color: #000; background-color: #fff;">Michel Gaibor Vásquez</td>
                                </tr>
                                <tr>
                                    <td style="border: 1px solid #000; padding: 3px 6px; text-align: left; font-weight: bold; background-color: #e4dfec; color: #000;">Cargo</td>
                                    <td style="border: 1px solid #000; padding: 3px 6px; text-align: center; color: #000; background-color: #fff;">Odontóloga de Bienestar Universitario</td>
                                    <td style="border: 1px solid #000; padding: 3px 6px; text-align: center; color: #000; background-color: #fff;">Coordinadora de Bienestar Universitario</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pie de Página Institucional -->
                    <div class="page-footer-container" style="margin-top: 18px; border-top: 1px solid #cbd5e1; padding-top: 5px; font-size: 7.5px; line-height: 1.3; color: #1e3a8a; text-align: left; font-family: Arial, sans-serif; page-break-inside: avoid !important; break-inside: avoid !important;">
                        <div>Dirección: &nbsp;Av. Ernesto Che Guevara y Gabriel Secaira</div>
                        <div>Guaranda-Ecuador</div>
                        <div>Teléfono: (593) 3220-6010 &nbsp;<strong>EXT 1168</strong></div>
                        <div><strong>www.ueb.edu.ec</strong></div>
                    </div>
                </div>

                ${forPrint ? `
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 300);
                        };
                    </script>
                ` : ''}
            </body>
            </html>
        `;
        } catch (err) {
            console.error("Error al compilar informe general HTML:", err);
            return `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; padding: 30px; text-align: center;">
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px;">
                        <h4 style="color: #1e3a8a; margin: 0 0 8px 0;">Cargando informe mensual...</h4>
                        <p style="color: #64748b; font-size: 12px; margin: 0;">Los datos se están procesando correctamente.</p>
                    </div>
                </body>
                </html>
            `;
        }
    };

    const handlePrintGeneralReport = () => {
        if (!genReportData) return;
        printIframeDocument(mensualIframeRef, () => compileGeneralReportHtmlString(genReportData, false));
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
                tipo_atencion: item.tipo_atencion || 'secundaria',
                fecha: item.fecha ? item.fecha.slice(0, 10) : '',
                detalle_evolucion: item.detalle_tratamiento || item.observaciones,
                procedimiento: item.detalle_procedimiento || 'Evolución clínica odontológica',
                prescripcion_medica: item.prescripción_farmaceutica
            }));
            const mappedDiario = (diarioRes.data.data || []).map(item => ({
                ...item,
                type: 'diario',
                recordTitle: 'Atención Diario Odontología',
                tipo_atencion: item.tipo_atencion || 'primaria',
                tipo_atencion2: item.tipo_atencion2 || 'curativo',
                fecha: item.fecha ? item.fecha.slice(0, 10) : '',
                detalle_diagnostico: item.detalle_diagnostico,
                procedimiento: item.procedimiento
            }));

            // Evitar duplicados automáticos entre historial-evolución y parte-diario
            const uniqueRecords = [];
            mappedEvol.forEach(item => {
                uniqueRecords.push(item);
            });
            mappedDiario.forEach(item => {
                const match = item.detalle_diagnostico && item.detalle_diagnostico.match(/Sesión de evolución/i);
                if (match && mappedEvol.some(e => e.fecha === item.fecha)) {
                    return; // Ya representado con más detalle en mappedEvol
                }
                uniqueRecords.push(item);
            });

            const combined = uniqueRecords.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
            setAreaHistories({ odontologia: combined });
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
                (record.type === 'evolucion');

            // Inicia un nuevo tratamiento si es 'primaria' O si no hay ningún tratamiento activo aún
            const startsNewTreatment = record.tipo_atencion === 'primaria' ||
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
                    diagnostico: record.detalle_diagnostico || record.detalle_tratamiento || record.detalle_motivo || record.procedimiento || 'Consulta y Diagnóstico Odontológico',
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
                        diagnostico: record.detalle_diagnostico || record.detalle_tratamiento || record.procedimiento || 'Tratamiento Odontológico',
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
        return processCitasAndTreatments(areaHistories.odontologia || []);
    }, [areaHistories.odontologia]);

    const handleSaveEvolucion = async (e) => {
        e.preventDefault();
        const pId = selectedPatient?.id_usuario || selectedPatient?.id;
        if (!selectedPatient || !evolucionForm.detalle_tratamiento.trim() || !pId) return;

        try {
            await api.post('/odontologia/historial-evolucion', {
                id_usuario_paciente: pId,
                fecha: evolucionForm.fecha,
                detalle_tratamiento: evolucionForm.detalle_tratamiento,
                detalle_procedimiento: evolucionForm.detalle_procedimiento,
                prescripción_farmaceutica: evolucionForm.prescripción_farmaceutica
            });

            // Registrar parte diario automático
            const today = getLocalDateString();
            const dailyPayload = {
                id_usuario_paciente: pId,
                fecha: today,
                tipo_atencion: 'secundaria',
                tipo_atencion2: 'curativo',
                detalle_diagnostico: `Sesión de evolución: ${evolucionForm.detalle_tratamiento}`,
                procedimiento: evolucionForm.detalle_procedimiento || 'Control Odontológico'
            };

            await api.post('/odontologia/parte-diario-odontologia', dailyPayload).catch(() => { });

            showSystemToast("Sesión de evolución registrada con éxito.");
            setEvolucionForm(prev => ({
                ...prev,
                detalle_tratamiento: '',
                detalle_procedimiento: 'Evolución clínica odontológica',
                prescripción_farmaceutica: 'Ninguna'
            }));
            setIsEvolucionModalOpen(false);
            fetchEvoluciones(pId);
            fetchPatientHistoryByArea(pId);
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

    const compileCitasReportHtmlString = (forPrint = false) => {
        const formattedFecha = new Date(reportCitasFecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const total = reportCitasList.length;
        const completadas = reportCitasList.filter(c => c.estado === 'completada').length;
        const canceladas = reportCitasList.filter(c => c.estado === 'cancelada').length;
        const programadas = reportCitasList.filter(c => c.estado === 'programada').length;
        const confirmadas = reportCitasList.filter(c => c.estado === 'confirmada').length;

        const tableRowsHtml = reportCitasList.length === 0 ? `
            <tr>
                <td colspan="7" style="padding: 30px; color: #64748b; font-style: italic; text-align: center;">No hay citas registradas en la fecha y filtros seleccionados.</td>
            </tr>
        ` : reportCitasList.map((cita, idx) => {
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

        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Reporte de Citas de Odontología - ${formattedFecha}</title>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 12mm;
                    }
                    * { box-sizing: border-box; }
                    body {
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        font-size: 10px;
                        color: #333;
                        margin: 0;
                        padding: 15px;
                        background-color: #f8fafc;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        min-height: 100vh;
                    }
                    .page-sheet {
                        background-color: #ffffff;
                        width: 100%;
                        max-width: 850px;
                        min-height: 250mm;
                        padding: 15mm;
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                        border-radius: 6px;
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
                            max-width: none;
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
                            <div style="width: 140px; display: flex; align-items: center;">
                                <img src="${logoBienestar}" alt="Bienestar Universitario UEB" style="max-height: 48px; width: auto; object-fit: contain;" />
                            </div>
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
                ${forPrint ? `
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 300);
                        };
                    </script>
                ` : ''}
            </body>
            </html>
        `;
    };

    const handlePrintReporteCitasRango = () => {
        if (reportCitasList.length === 0) {
            showSystemToast('No hay citas en esta fecha para generar el reporte.');
            return;
        }
        printIframeDocument(citasIframeRef, () => compileCitasReportHtmlString(false));
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
                            <div class="header-logo" style="width: 140px; display: flex; align-items: center;">
                                <img src="${logoBienestar}" alt="Bienestar Universitario UEB" style="max-height: 48px; width: auto; object-fit: contain;" />
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

        const fallbackColors = {
            1: '#ef4444',
            2: '#3b82f6',
            3: '#eab308',
            4: '#475569',
            'caries': '#ef4444',
            'obturado': '#3b82f6',
            'corona': '#eab308',
            'ausente': '#475569'
        };

        const getFaceColor = (faceState) => {
            if (!faceState || faceState === 'sano') return '#ffffff';
            if (typeof faceState === 'string' && faceState.startsWith('#')) return faceState;
            const stateObj = odontogramaEstados.find(e =>
                String(e.id) === String(faceState) ||
                e.nombre.toLowerCase() === String(faceState).toLowerCase()
            );
            if (stateObj && stateObj.color) return stateObj.color;
            const lower = String(faceState).toLowerCase();
            return fallbackColors[faceState] || fallbackColors[lower] || '#ffffff';
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

    const handleDownloadHistoriaClinicaPdf = async (patientId, targetDateOrRecord) => {
        const actualPatientId = patientId || selectedPatient?.id_usuario || selectedPatient?.id || selectedPatient?.id_paciente;
        if (!actualPatientId) {
            showSystemToast("Seleccione un paciente para imprimir la hoja de evolución.");
            return;
        }

        showSystemToast("Generando reporte imprimible...");

        try {
            // 1. Fetch complete profile and history lists safely
            const [
                profileRes,
                motivoRes,
                examenRes,
                periodontalRes,
                evolucionRes,
                diarioRes,
                odontogramaRes
            ] = await Promise.all([
                api.get(`/odontologia/pacientes/${actualPatientId}/perfil`).catch(() => ({ data: { data: selectedPatient || {} } })),
                api.get('/odontologia/motivo-consulta', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/examen', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/enfermedad-periodontal', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/historial-evolucion', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get('/odontologia/parte-diario-odontologia', { params: { id_usuario_paciente: actualPatientId } }).catch(() => ({ data: { data: [] } })),
                api.get(`/odontologia/odontograma-paciente/${actualPatientId}`).catch(() => ({ data: { data: null } }))
            ]);

            const patient = profileRes?.data?.data || selectedPatient || {};
            const ident = patient.datos_identificacion || patient.identificacion || patient || {};

            const patientName = `${ident.primer_nombre || ident.nombres || selectedPatient?.nombres || ''} ${ident.segundo_nombre || ''} ${ident.apellido_paterno || ident.apellidos || selectedPatient?.apellidos || ''} ${ident.apellido_materno || ''}`.replace(/\s+/g, ' ').trim() || selectedPatient?.nombre_completo || selectedPatient?.name || 'Paciente';
            const patientCedula = ident.numero_cedula || selectedPatient?.numero_cedula || selectedPatient?.cedula || '—';

            // Calculate age
            const birthdate = ident.fecha_nacimiento || selectedPatient?.fecha_nacimiento;
            let patientAge = '—';
            if (birthdate) {
                const birth = new Date(birthdate);
                const diff = Date.now() - birth.getTime();
                const ageDate = new Date(diff);
                patientAge = `${Math.abs(ageDate.getUTCFullYear() - 1970)} años`;
            }

            const printDate = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit' });

            // Motivo de consulta
            const motivos = motivoRes?.data?.data || [];
            const activeMotivo = motivos.length > 0 ? motivos[motivos.length - 1] : {};

            // Antecedentes
            const alergiasList = (patient.alergias || []).map(a => a.nombre_alergia || a.nombre).filter(Boolean);
            const disCapList = (patient.discapacidades || []).map(d => d.nombre_discapacidad || d.nombre).filter(Boolean);
            let antecedentesPersonales = 'No refiere.';
            if (alergiasList.length > 0 || disCapList.length > 0) {
                const parts = [];
                if (alergiasList.length > 0) parts.push(`Alergias: ${alergiasList.join(', ')}`);
                if (disCapList.length > 0) parts.push(`Discapacidades: ${disCapList.join(', ')}`);
                antecedentesPersonales = parts.join(' | ');
            }
            const antecedentesFamiliares = 'No refiere.';

            // Examen Intra/Extrabucal
            const examenes = examenRes?.data?.data || [];
            const activeExamen = examenes.length > 0 ? examenes[examenes.length - 1] : {};

            // Periodontal
            const periodontales = periodontalRes?.data?.data || [];
            const activePeriodontal = periodontales.length > 0 ? periodontales[periodontales.length - 1] : {};

            // Odontograma mapping (Permanent and Deciduous teeth in FDI system)
            const upperRightPermanent = [18, 17, 16, 15, 14, 13, 12, 11];
            const upperLeftPermanent = [21, 22, 23, 24, 25, 26, 27, 28];
            const upperRightDeciduous = [55, 54, 53, 52, 51];
            const upperLeftDeciduous = [61, 62, 63, 64, 65];
            const lowerRightDeciduous = [85, 84, 83, 82, 81];
            const lowerLeftDeciduous = [71, 72, 73, 74, 75];
            const lowerRightPermanent = [48, 47, 46, 45, 44, 43, 42, 41];
            const lowerLeftPermanent = [31, 32, 33, 34, 35, 36, 37, 38];

            const allTeeth = [
                ...upperRightPermanent, ...upperLeftPermanent,
                ...upperRightDeciduous, ...upperLeftDeciduous,
                ...lowerRightDeciduous, ...lowerLeftDeciduous,
                ...lowerRightPermanent, ...lowerLeftPermanent
            ];

            const teethState = {};
            allTeeth.forEach(num => {
                teethState[num] = { top: 'sano', bottom: 'sano', left: 'sano', right: 'sano', center: 'sano', ausente: false };
            });

            // 1. Si es el paciente activo en la sesión actual, tomar su estado de odontograma en memoria React
            const isCurrentActivePatient = String(actualPatientId) === String(selectedPatient?.id_usuario || selectedPatient?.id || selectedPatient?.id_paciente);
            if (isCurrentActivePatient && odontogramaState) {
                Object.keys(odontogramaState).forEach(numStr => {
                    const num = parseInt(numStr);
                    if (teethState[num] && odontogramaState[num]) {
                        teethState[num] = { ...odontogramaState[num] };
                    }
                });
            }

            // 2. Recuperar asignaciones guardadas en BD
            const odData = odontogramaRes?.data?.data || patientOdontograma || null;
            if (odData && odData.asignaciones && odData.asignaciones.length > 0) {
                odData.asignaciones.forEach(assign => {
                    const universalNum = assign.pieza ? assign.pieza.numero_pieza_dental : null;
                    if (!universalNum) return;

                    const fdiNum = Object.keys(fdiToUniversal).find(
                        key => String(fdiToUniversal[key]).toUpperCase() === String(universalNum).toUpperCase()
                    );
                    if (!fdiNum || !teethState[fdiNum]) return;

                    const stateObj = assign.estado || odontogramaEstados.find(e => e.id === assign.id_estado);
                    const stateName = stateObj ? stateObj.nombre.toLowerCase() : '';
                    const stateColor = stateObj?.color || null;

                    if (assign.id_numero_carilla === null) {
                        if (stateName === 'ausente' || assign.id_estado === 4) {
                            teethState[fdiNum].ausente = true;
                        }
                    } else {
                        const carillaName = assign.carilla ? assign.carilla.numero_carilla.toLowerCase() : '';
                        const face = getSvgFaceName(parseInt(fdiNum), carillaName);
                        if (face && teethState[fdiNum]) {
                            if (!isCurrentActivePatient || teethState[fdiNum][face] === 'sano') {
                                teethState[fdiNum][face] = stateColor || assign.id_estado;
                            }
                        }
                    }
                });
            }

            const stateColors = {
                1: '#ef4444',
                2: '#3b82f6',
                3: '#eab308',
                4: '#475569',
                'caries': '#ef4444',
                'obturado': '#3b82f6',
                'corona': '#eab308',
                'ausente': '#475569'
            };

            const getToothColor = (state) => {
                if (!state || state === 'sano') return '#ffffff';
                if (typeof state === 'string' && state.startsWith('#')) return state;
                const stateObj = odontogramaEstados.find(e =>
                    String(e.id) === String(state) ||
                    e.nombre.toLowerCase() === String(state).toLowerCase()
                );
                if (stateObj && stateObj.color) return stateObj.color;
                const lower = String(state).toLowerCase();
                return stateColors[state] || stateColors[lower] || '#ffffff';
            };

            const renderToothSvgHtml = (num) => {
                const t = teethState[num] || { top: 'sano', bottom: 'sano', left: 'sano', right: 'sano', center: 'sano', ausente: false };
                const topVal = getToothColor(t.top);
                const rightVal = getToothColor(t.right);
                const bottomVal = getToothColor(t.bottom);
                const leftVal = getToothColor(t.left);
                const centerVal = getToothColor(t.center);
                const isAus = t.ausente;

                return `
                    <div style="display: inline-flex; flex-direction: column; align-items: center; width: 23px; margin: 0 1px;">
                        <span style="font-size: 7.5px; font-weight: bold; margin-bottom: 1px; color: #1e293b;">${num}</span>
                        <div style="position: relative; width: 21px; height: 21px;">
                            <svg viewBox="0 0 40 40" style="width: 21px; height: 21px; overflow: visible;">
                                <circle cx="20" cy="20" r="19" fill="#ffffff" stroke="#334155" stroke-width="1.2" />
                                <path d="M 6.57,6.57 A 19,19 0 0,1 33.43,6.57 L 26.36,13.64 A 9,9 0 0,0 13.64,13.64 Z" fill="${topVal}" stroke="#334155" stroke-width="0.8" />
                                <path d="M 33.43,6.57 A 19,19 0 0,1 33.43,33.43 L 26.36,26.36 A 9,9 0 0,0 26.36,13.64 Z" fill="${rightVal}" stroke="#334155" stroke-width="0.8" />
                                <path d="M 33.43,33.43 A 19,19 0 0,1 6.57,33.43 L 13.64,26.36 A 9,9 0 0,0 26.36,26.36 Z" fill="${bottomVal}" stroke="#334155" stroke-width="0.8" />
                                <path d="M 6.57,33.43 A 19,19 0 0,1 6.57,6.57 L 13.64,13.64 A 9,9 0 0,0 13.64,26.36 Z" fill="${leftVal}" stroke="#334155" stroke-width="0.8" />
                                <circle cx="20" cy="20" r="9" fill="${centerVal}" stroke="#334155" stroke-width="0.8" />
                                ${isAus ? '<line x1="2" y1="2" x2="38" y2="38" stroke="#ef4444" stroke-width="2.5" /><line x1="38" y1="2" x2="2" y2="38" stroke="#ef4444" stroke-width="2.5" />' : ''}
                            </svg>
                        </div>
                        ${isAus ? '<span style="font-size: 6px; color: #ef4444; font-weight: bold; line-height: 1;">AUS</span>' : ''}
                    </div>
                `;
            };

            // Build complete unified list of evolutions / consultations for Page 2
            const rawEvolList = evolucionRes?.data?.data || [];
            const rawDiarioList = diarioRes?.data?.data || [];

            let allPatientRecords = (areaHistories?.odontologia && areaHistories.odontologia.length > 0)
                ? [...areaHistories.odontologia]
                : [];

            if (allPatientRecords.length === 0) {
                const combined = [];
                rawEvolList.forEach(item => {
                    combined.push({
                        id: item.id,
                        fecha: item.fecha ? String(item.fecha).slice(0, 10) : (item.created_at ? String(item.created_at).slice(0, 10) : ''),
                        detalle_diagnostico: item.diagnostico || '',
                        detalle_tratamiento: item.detalle_tratamiento || item.observaciones || '',
                        procedimiento: item.detalle_procedimiento || '',
                        prescripcion_medica: item.prescripción_farmaceutica || item.prescripcion_medica || '',
                        tipo_atencion: item.tipo_atencion || 'primaria'
                    });
                });
                rawDiarioList.forEach(item => {
                    const fDate = item.fecha ? String(item.fecha).slice(0, 10) : (item.created_at ? String(item.created_at).slice(0, 10) : '');
                    const already = combined.some(c => c.fecha === fDate && c.procedimiento === item.procedimiento);
                    if (!already) {
                        combined.push({
                            id: item.id,
                            fecha: fDate,
                            detalle_diagnostico: item.detalle_diagnostico || '',
                            detalle_tratamiento: item.tipo_atencion2 || item.detalle_evolucion || '',
                            procedimiento: item.procedimiento || '',
                            prescripcion_medica: item.prescripcion_medica || item.prescripción_farmaceutica || '',
                            tipo_atencion: item.tipo_atencion || 'primaria'
                        });
                    }
                });
                allPatientRecords = combined;
            }

            const calculatedTreatments = processCitasAndTreatments(allPatientRecords);

            // Determinar las citas del tratamiento objetivo:
            // "si son consultas primarias, con una fila seria suficiente pero si hay mas (un historial), ahi si las filas según la cantidad de citas que haya durado el tratamiento."
            let targetCitas = [];

            if (targetDateOrRecord && targetDateOrRecord.citas && Array.isArray(targetDateOrRecord.citas)) {
                targetCitas = targetDateOrRecord.citas;
            } else if (targetDateOrRecord && targetDateOrRecord.treatment && Array.isArray(targetDateOrRecord.treatment.citas)) {
                targetCitas = targetDateOrRecord.treatment.citas;
            } else if (targetDateOrRecord) {
                const targetId = targetDateOrRecord.id;
                const recDate = typeof targetDateOrRecord === 'string' ? targetDateOrRecord : (targetDateOrRecord.fecha || targetDateOrRecord.created_at || '');
                const foundTreatment = calculatedTreatments.find(t =>
                    t.citas?.some(c => (targetId && c.id === targetId) || (recDate && (c.fecha === recDate || String(c.fecha).startsWith(recDate.slice(0, 10)))))
                );
                if (foundTreatment && foundTreatment.citas) {
                    targetCitas = foundTreatment.citas;
                } else if (typeof targetDateOrRecord === 'object' && targetDateOrRecord.id) {
                    targetCitas = [targetDateOrRecord];
                }
            }

            // Fallback: Si no se especificó un registro objetivo, seleccionar el tratamiento activo o más reciente
            if (targetCitas.length === 0 && calculatedTreatments.length > 0) {
                const activeTreatment = calculatedTreatments.find(t => t.estado === 'en_curso') || calculatedTreatments[calculatedTreatments.length - 1];
                if (activeTreatment && activeTreatment.citas && activeTreatment.citas.length > 0) {
                    targetCitas = activeTreatment.citas;
                }
            }

            // Ordenar citas cronológicamente (de la más antigua a la más reciente del tratamiento)
            targetCitas.sort((a, b) => {
                const dA = a.fecha || a.created_at || '';
                const dB = b.fecha || b.created_at || '';
                return dA.localeCompare(dB);
            });

            // Construir filas según estrictamente la cantidad de citas del tratamiento (1 fila para primarias, N filas para historial)
            let evolutionsRows = '';
            if (targetCitas.length > 0) {
                evolutionsRows = targetCitas.map(ev => {
                    const fDate = ev.fecha ? String(ev.fecha).slice(0, 10) : (ev.created_at ? String(ev.created_at).slice(0, 10) : printDate);
                    const diag = ev.diagnostico || ev.detalle_diagnostico || ev.cie10_descripcion || '';
                    const trat = ev.tratamiento || ev.detalle_tratamiento || ev.detalle_evolucion || ev.tipo_atencion2 || '';
                    const proc = ev.procedimiento || ev.detalle_procedimiento || '';
                    const presc = ev.prescripcion || ev.prescripcion_medica || ev.prescripción_farmaceutica || 'Sin prescripción.';

                    return `
                        <tr style="vertical-align: top; font-size: 8.5px;">
                            <td style="border: 1px solid #000; padding: 6px 4px; text-align: center; font-weight: bold; width: 14%;">
                                ${fDate}
                            </td>
                            <td style="border: 1px solid #000; padding: 6px 8px; width: 56%; line-height: 1.35;">
                                ${diag ? `<div><strong>Diagnóstico:</strong> ${diag}</div>` : ''}
                                ${trat ? `<div><strong>Tratamiento:</strong> ${trat}</div>` : ''}
                                ${proc ? `<div><strong>Procedimiento:</strong> ${proc}</div>` : ''}
                                ${!diag && !trat && !proc ? '<div>Consulta y Evaluación Odontológica</div>' : ''}
                            </td>
                            <td style="border: 1px solid #000; padding: 6px 8px; width: 30%; line-height: 1.35;">
                                ${presc}
                            </td>
                        </tr>
                    `;
                }).join('');
            } else {
                // Consulta primaria actual en curso
                const currentDiag = fichaForm.detalle_diagnostico || fichaForm.cie10_nombre || fichaForm.detalle_motivo || '';
                const currentTrat = fichaForm.detalle_tratamiento || '';
                const currentProc = fichaForm.procedimiento || '';
                const currentPresc = (recetaList && recetaList.length > 0)
                    ? recetaList.map(r => `${r.detalle_medicamento} (${r.detalle_dosis || ''})`).join(', ')
                    : 'Sin prescripción.';

                evolutionsRows = `
                    <tr style="vertical-align: top; font-size: 8.5px;">
                        <td style="border: 1px solid #000; padding: 6px 4px; text-align: center; font-weight: bold; width: 14%;">
                            ${printDate}
                        </td>
                        <td style="border: 1px solid #000; padding: 6px 8px; width: 56%; line-height: 1.35;">
                            ${currentDiag ? `<div><strong>Diagnóstico:</strong> ${currentDiag}</div>` : ''}
                            ${currentTrat ? `<div><strong>Tratamiento:</strong> ${currentTrat}</div>` : ''}
                            ${currentProc ? `<div><strong>Procedimiento:</strong> ${currentProc}</div>` : ''}
                            ${!currentDiag && !currentTrat && !currentProc ? '<div>Consulta Odontológica Primaria</div>' : ''}
                        </td>
                        <td style="border: 1px solid #000; padding: 6px 8px; width: 30%; line-height: 1.35;">
                            ${currentPresc}
                        </td>
                    </tr>
                `;
            }

            // 2. Generate HTML layout matching the exact printable dental clinical history and evolution sheet
            const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Historia Clínica Odontológica - Hoja de Evolución</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 8mm 10mm;
        }
        * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            color: #000000;
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
            padding: 10mm 12mm;
            box-sizing: border-box;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            margin-bottom: 25px;
        }
        .page-break {
            page-break-after: always;
            break-after: page;
            height: 0;
            display: block;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        @media screen {
            body {
                background-color: #cbd5e1;
                padding: 20px;
            }
            .page-sheet {
                box-shadow: 0 6px 18px rgba(0,0,0,0.15);
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
                margin: 0 0 20px 0 !important;
                background-color: transparent !important;
            }
            .no-print {
                display: none !important;
            }
        }
    </style>
</head>
<body>

    <!-- ========================================== -->
    <!-- HOJA 1: HISTORIA CLÍNICA ODONTOLÓGICA      -->
    <!-- ========================================== -->
    <div class="page-sheet">
        <!-- Encabezado Institucional -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 2px solid #002040; padding-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${headerBienestar}" alt="UEB Bienestar Universitario" style="max-height: 40px; width: auto;" />
            </div>
            <div style="text-align: right; font-size: 8px; color: #475569; line-height: 1.2;">
                <strong>UNIVERSIDAD ESPÍRITU SANTO</strong><br/>
                DIRECCIÓN DE BIENESTAR UNIVERSITARIO<br/>
                ÁREA DE ODONTOLOGÍA
            </div>
        </div>

        <!-- Títulos Oficiales -->
        <div style="text-align: center; margin: 3px 0 6px 0;">
            <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #000;">HOJA DE EVOLUCIÓN</div>
            <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #000;">HISTORIA CLÍNICA ODONTOLÓGICA</div>
        </div>

        <!-- Barra de Identificación de Paciente -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 9px; border: 1px solid #000;">
            <tr style="background: #f8fafc;">
                <td style="padding: 3px 6px; border: 1px solid #000; width: 50%;">
                    <strong>PACIENTE:</strong> ${patientName}
                </td>
                <td style="padding: 3px 6px; border: 1px solid #000; width: 25%;">
                    <strong>CÉDULA:</strong> ${patientCedula}
                </td>
                <td style="padding: 3px 6px; border: 1px solid #000; width: 12%;">
                    <strong>EDAD:</strong> ${patientAge}
                </td>
                <td style="padding: 3px 6px; border: 1px solid #000; width: 13%;">
                    <strong>FECHA:</strong> ${printDate}
                </td>
            </tr>
        </table>

        <!-- 1. BLOQUE SUPERIOR: MOTIVO DE CONSULTA Y ANTECEDENTES -->
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 8.5px; margin-bottom: 8px;">
            <thead>
                <tr style="background: #e0e0e0; font-weight: bold; text-align: center;">
                    <th style="border: 1px solid #000; padding: 3px; width: 24%;">FECHA</th>
                    <th style="border: 1px solid #000; padding: 3px; width: 48%;">DIAGNOSTICO/TRATAMIENTO/PROCEDIMIENTOS</th>
                    <th style="border: 1px solid #000; padding: 3px; width: 28%;">PRESCRIPCIÓN</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px 6px; background: #e0e0e0; font-weight: bold;">Motivo de la consulta:</td>
                    <td colspan="2" style="border: 1px solid #000; padding: 3px 6px;">${activeMotivo.detalle_motivo || ''}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px 6px; background: #e0e0e0; font-weight: bold;">¿Cuándo fue su última visita el odontólogo?</td>
                    <td colspan="2" style="border: 1px solid #000; padding: 3px 6px;">${activeMotivo.ultima_visita_fecha || ''}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px 6px; background: #e0e0e0; font-weight: bold;">¿Esta Ud. en algún tratamiento?</td>
                    <td colspan="2" style="border: 1px solid #000; padding: 0;">
                        <table style="width: 100%; border-collapse: collapse; margin: 0; font-size: 8.5px;">
                            <tr>
                                <td style="border: none; border-right: 1px solid #000; padding: 3px; width: 28px; background: #e0e0e0; font-weight: bold; text-align: center;">SI</td>
                                <td style="border: none; border-right: 1px solid #000; padding: 3px; width: 32px; text-align: center; font-weight: bold;">${activeMotivo.algun_tratamiento === 'si' ? 'X' : ''}</td>
                                <td style="border: none; border-right: 1px solid #000; padding: 3px; width: 28px; background: #e0e0e0; font-weight: bold; text-align: center;">NO</td>
                                <td style="border: none; border-right: 1px solid #000; padding: 3px; width: 32px; text-align: center; font-weight: bold;">${activeMotivo.algun_tratamiento !== 'si' && activeMotivo.algun_tratamiento ? 'X' : ''}</td>
                                <td style="border: none; border-right: 1px solid #000; padding: 3px 6px; width: 165px; background: #e0e0e0; font-weight: bold;">¿Especifique el tratamiento?</td>
                                <td style="border: none; padding: 3px 6px;">${activeMotivo.algun_tratamiento === 'si' ? (activeMotivo.detalle_tratamiento || '') : ''}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px 6px; background: #e0e0e0; font-weight: bold;">¿Toma algún medicamento?</td>
                    <td colspan="2" style="border: 1px solid #000; padding: 0;">
                        <table style="width: 100%; border-collapse: collapse; margin: 0; font-size: 8.5px;">
                            <tr>
                                <td style="border: none; border-right: 1px solid #000; padding: 3px; width: 28px; background: #e0e0e0; font-weight: bold; text-align: center;">SI</td>
                                <td style="border: none; border-right: 1px solid #000; padding: 3px; width: 32px; text-align: center; font-weight: bold;">${activeMotivo.algun_medicamento === 'si' ? 'X' : ''}</td>
                                <td style="border: none; border-right: 1px solid #000; padding: 3px; width: 28px; background: #e0e0e0; font-weight: bold; text-align: center;">NO</td>
                                <td style="border: none; border-right: 1px solid #000; padding: 3px; width: 32px; text-align: center; font-weight: bold;">${activeMotivo.algun_medicamento !== 'si' && activeMotivo.algun_medicamento ? 'X' : ''}</td>
                                <td style="border: none; border-right: 1px solid #000; padding: 3px 6px; width: 165px; background: #e0e0e0; font-weight: bold;">¿Especifique el medicamento?</td>
                                <td style="border: none; padding: 3px 6px;">${activeMotivo.algun_medicamento === 'si' ? (activeMotivo.detalle_medicamento || '') : ''}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr style="height: 6px;">
                    <td colspan="3" style="border: 1px solid #000; background: #ffffff;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px 6px; background: #e0e0e0; font-weight: bold;">¿Antecedentes personales?</td>
                    <td colspan="2" style="border: 1px solid #000; padding: 3px 6px;">${antecedentesPersonales}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 3px 6px; background: #e0e0e0; font-weight: bold;">¿Antecedentes Familiares?</td>
                    <td colspan="2" style="border: 1px solid #000; padding: 3px 6px;">${antecedentesFamiliares}</td>
                </tr>
            </tbody>
        </table>

        <!-- 2. EXAMEN INTRA-BUCAL Y EXTRABUCAL -->
        <div style="text-align: center; font-weight: bold; border: 1px solid #000; border-bottom: none; padding: 3px; font-size: 9.5px; background: #ffffff; text-transform: uppercase;">
            EXAMEN INTRA-BUCAL Y EXTRABUCAL
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 8px; margin-bottom: 8px;">
            <thead>
                <tr style="background: #e0e0e0; font-weight: bold;">
                    <th style="border: 1px solid #000; padding: 2px 6px; text-align: left; width: 22%;">TIPO</th>
                    <th style="border: 1px solid #000; padding: 2px; text-align: center; width: 14%;">NORMAL</th>
                    <th style="border: 1px solid #000; padding: 2px; text-align: center; width: 14%;">ANORMAL</th>
                    <th style="border: 1px solid #000; padding: 2px 6px; text-align: left; width: 22%;">TIPO</th>
                    <th style="border: 1px solid #000; padding: 2px; text-align: center; width: 14%;">NORMAL</th>
                    <th style="border: 1px solid #000; padding: 2px; text-align: center; width: 14%;">ANORMAL</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">PIEL</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.piel === 'normal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.piel === 'anormal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">GLÁNDULAS SALIVALES</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen['glándulas_salivales'] === 'normal' || activeExamen.glandulas_salivales === 'normal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen['glándulas_salivales'] === 'anormal' || activeExamen.glandulas_salivales === 'anormal' ? 'X' : ''}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">LABIOS</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.labios === 'normal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.labios === 'anormal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">GANGLIOS</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.ganglios === 'normal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.ganglios === 'anormal' ? 'X' : ''}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">CARRILLOS</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.carrillos === 'normal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.carrillos === 'anormal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">TEJIDO MUSCULAR</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.tejido_muscular === 'normal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.tejido_muscular === 'anormal' ? 'X' : ''}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">PALADAR</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.paladar === 'normal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.paladar === 'anormal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">ATM</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.atm === 'normal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.atm === 'anormal' ? 'X' : ''}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">PISO DE LA BOCA</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.piso_de_la_boca === 'normal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.piso_de_la_boca === 'anormal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">MAXILAR SUPERIOR</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.maxilar_superior === 'normal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.maxilar_superior === 'anormal' ? 'X' : ''}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">LENGUA</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.lengua === 'normal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.lengua === 'anormal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">MAXILAR INFERIOR</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.maxilar_inferior === 'normal' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activeExamen.maxilar_inferior === 'anormal' ? 'X' : ''}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">OBSERVACIONES:</td>
                    <td colspan="5" style="border: 1px solid #000; padding: 2px 6px; height: 16px;">${activeExamen.observaciones || ''}</td>
                </tr>
            </tbody>
        </table>

        <!-- 3. ODONTOGRAMA -->
        <div style="text-align: center; font-weight: bold; border: 1px solid #000; border-bottom: none; padding: 3px; font-size: 9.5px; background: #ffffff; text-transform: uppercase;">
            ODONTOGRAMA
        </div>
        <div style="border: 1px solid #000; padding: 6px 10px; background: #ffffff; margin-bottom: 8px;">
            <!-- Cuadrantes Superiores Permanentes -->
            <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 3px;">
                <div style="display: flex; justify-content: flex-end; width: 215px;">
                    ${upperRightPermanent.map(num => renderToothSvgHtml(num)).join('')}
                </div>
                <div style="width: 1px; height: 35px; background: #000; margin: 0 10px;"></div>
                <div style="display: flex; justify-content: flex-start; width: 215px;">
                    ${upperLeftPermanent.map(num => renderToothSvgHtml(num)).join('')}
                </div>
            </div>
            <!-- Cuadrantes Superiores Temporales (Niños) -->
            <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 4px;">
                <div style="display: flex; justify-content: flex-end; width: 215px;">
                    ${upperRightDeciduous.map(num => renderToothSvgHtml(num)).join('')}
                </div>
                <div style="width: 1px; height: 35px; background: #000; margin: 0 10px;"></div>
                <div style="display: flex; justify-content: flex-start; width: 215px;">
                    ${upperLeftDeciduous.map(num => renderToothSvgHtml(num)).join('')}
                </div>
            </div>

            <!-- Línea divisoria en cruz central -->
            <div style="width: 88%; height: 1px; background: #000; margin: 3px auto 4px auto;"></div>

            <!-- Cuadrantes Inferiores Temporales (Niños) -->
            <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 3px;">
                <div style="display: flex; justify-content: flex-end; width: 215px;">
                    ${lowerRightDeciduous.map(num => renderToothSvgHtml(num)).join('')}
                </div>
                <div style="width: 1px; height: 35px; background: #000; margin: 0 10px;"></div>
                <div style="display: flex; justify-content: flex-start; width: 215px;">
                    ${lowerLeftDeciduous.map(num => renderToothSvgHtml(num)).join('')}
                </div>
            </div>
            <!-- Cuadrantes Inferiores Permanentes -->
            <div style="display: flex; justify-content: center; align-items: center;">
                <div style="display: flex; justify-content: flex-end; width: 215px;">
                    ${lowerRightPermanent.map(num => renderToothSvgHtml(num)).join('')}
                </div>
                <div style="width: 1px; height: 35px; background: #000; margin: 0 10px;"></div>
                <div style="display: flex; justify-content: flex-start; width: 215px;">
                    ${lowerLeftPermanent.map(num => renderToothSvgHtml(num)).join('')}
                </div>
            </div>
        </div>

        <!-- 4. ENFERMEDAD PERIODONTAL -->
        <table style="width: 220px; margin: 6px auto 0 auto; border-collapse: collapse; border: 1px solid #000; font-size: 8.5px;">
            <thead>
                <tr>
                    <th colspan="3" style="background: #e0e0e0; border: 1px solid #000; padding: 2px; font-weight: bold; text-align: center; text-transform: uppercase;">
                        ENFERMEDAD PERIODONTAL
                    </th>
                </tr>
                <tr style="background: #e0e0e0;">
                    <th style="border: 1px solid #000; padding: 2px 6px; text-align: left; font-weight: bold; width: 60%;">TIPO</th>
                    <th style="border: 1px solid #000; padding: 2px; text-align: center; font-weight: bold; width: 20%;">SI</th>
                    <th style="border: 1px solid #000; padding: 2px; text-align: center; font-weight: bold; width: 20%;">NO</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">Placa Bacteriana</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activePeriodontal.placa_bacteriana === 'si' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activePeriodontal.placa_bacteriana !== 'si' ? 'X' : ''}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">Cálculos Dentales</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activePeriodontal.calculos_dentales === 'si' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activePeriodontal.calculos_dentales !== 'si' ? 'X' : ''}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">Bolsa Periodontal</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activePeriodontal.bolsa_periodontal === 'si' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activePeriodontal.bolsa_periodontal !== 'si' ? 'X' : ''}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #000; padding: 2px 6px; background: #e0e0e0; font-weight: bold;">Movilidad Dental</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activePeriodontal.movilidad_dental === 'si' ? 'X' : ''}</td>
                    <td style="border: 1px solid #000; text-align: center; font-weight: bold;">${activePeriodontal.movilidad_dental !== 'si' ? 'X' : ''}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Salto de página oficial -->
    <div class="page-break"></div>

    <!-- ========================================== -->
    <!-- HOJA 2: SEGUIMIENTO Y EVOLUCIÓN DENTAL     -->
    <!-- ========================================== -->
    <div class="page-sheet">
        <!-- Encabezado Institucional -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 2px solid #002040; padding-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${headerBienestar}" alt="UEB Bienestar Universitario" style="max-height: 38px; width: auto;" />
            </div>
            <div style="text-align: right; font-size: 8px; color: #475569; line-height: 1.2;">
                <strong>UNIVERSIDAD ESPÍRITU SANTO</strong><br/>
                DIRECCIÓN DE BIENESTAR UNIVERSITARIO · ÁREA DE ODONTOLOGÍA
            </div>
        </div>

        <!-- Título -->
        <div style="text-align: center; margin: 4px 0 6px 0;">
            <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #000;">HOJA DE EVOLUCIÓN</div>
        </div>

        <!-- Paciente -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 9px; border: 1px solid #000;">
            <tr style="background: #f8fafc;">
                <td style="padding: 3px 6px; border: 1px solid #000; width: 60%;">
                    <strong>PACIENTE:</strong> ${patientName}
                </td>
                <td style="padding: 3px 6px; border: 1px solid #000; width: 40%;">
                    <strong>CÉDULA:</strong> ${patientCedula}
                </td>
            </tr>
        </table>

        <!-- Tabla de Evolución del Tratamiento Odontológico -->
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 9px;">
            <thead>
                <tr style="background: #e0e0e0; font-weight: bold; text-align: center;">
                    <th style="border: 1px solid #000; padding: 4px; width: 14%; text-transform: uppercase;">FECHA</th>
                    <th style="border: 1px solid #000; padding: 4px; width: 56%; text-transform: uppercase;">DIAGNOSTICO/TRATAMIENTO/PROCEDIMIENTOS</th>
                    <th style="border: 1px solid #000; padding: 4px; width: 30%; text-transform: uppercase;">PRESCRIPCIÓN</th>
                </tr>
            </thead>
            <tbody>
                ${evolutionsRows}
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

            // 3. Open in a new tab safely
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


    const renderMinimalistPagination = (currentPage, totalPages, totalItems, itemsPerPage, onPageChange) => {
        if (totalItems === 0) return null;
        const startIdx = (currentPage - 1) * itemsPerPage + 1;
        const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '18px',
                paddingTop: '14px',
                borderTop: '1px solid var(--border, #e2e8f0)',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '12px'
            }}>
                <div style={{ color: 'var(--text-muted, #64748b)' }}>
                    Mostrando <strong style={{ color: 'var(--text-primary, #0f172a)' }}>{startIdx}</strong> a <strong style={{ color: 'var(--text-primary, #0f172a)' }}>{endIdx}</strong> de <strong style={{ color: 'var(--text-primary, #0f172a)' }}>{totalItems}</strong> registros
                </div>

                {totalPages > 1 && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                            type="button"
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage <= 1}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border, #e2e8f0)',
                                background: currentPage <= 1 ? '#f8fafc' : '#ffffff',
                                color: currentPage <= 1 ? '#cbd5e1' : 'var(--text-primary, #334155)',
                                fontSize: '11.5px',
                                fontWeight: 500,
                                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <ChevronLeft size={13} /> Anterior
                        </button>

                        {totalPages <= 6 ? (
                            Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                                const isActive = p === currentPage;
                                return (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => onPageChange(p)}
                                        style={{
                                            minWidth: '30px',
                                            height: '30px',
                                            padding: '0 6px',
                                            borderRadius: '7px',
                                            border: isActive ? '1px solid var(--primary, #007788)' : '1px solid var(--border, #e2e8f0)',
                                            background: isActive ? 'var(--primary, #007788)' : '#ffffff',
                                            color: isActive ? '#ffffff' : 'var(--text-primary, #475569)',
                                            fontSize: '11.5px',
                                            fontWeight: isActive ? 600 : 500,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        {p}
                                    </button>
                                );
                            })
                        ) : (
                            <span style={{
                                padding: '5px 12px',
                                borderRadius: '7px',
                                background: '#f8fafc',
                                color: 'var(--text-secondary, #475569)',
                                fontWeight: 600,
                                fontSize: '11.5px',
                                border: '1px solid var(--border, #e2e8f0)'
                            }}>
                                Página <strong style={{ color: 'var(--primary, #007788)' }}>{currentPage}</strong> de {totalPages}
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage >= totalPages}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border, #e2e8f0)',
                                background: currentPage >= totalPages ? '#f8fafc' : '#ffffff',
                                color: currentPage >= totalPages ? '#cbd5e1' : 'var(--text-primary, #334155)',
                                fontSize: '11.5px',
                                fontWeight: 500,
                                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            Siguiente <ChevronRight size={13} />
                        </button>
                    </div>
                )}
            </div>
        );
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
                                                    activeTab === 'insumos' ? 'Insumos Médicos' :
                                                        activeTab === 'procedimientos' ? 'Procedimientos Odontológicos' :
                                                            activeTab === 'citas' ? 'Gestión de Citas' : 'Reportes'}
                                </h1>
                            </div>
                        </div>
                        <div className="topbar__right">
                            <NotificationMenu onNavigateToCitas={handleNavigateToCitasFromNotif} />
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
                                <section className="page-hero" style={{ marginBottom: '20px' }}>
                                    <div>
                                        <span className="page-hero__label"><Activity size={14} style={{ marginRight: '6px', display: 'inline' }} /> Odontología Clínica</span>
                                        <h2>Odontograma Interactivo</h2>
                                        <p>Mapeo dental digital, registro de diagnósticos y tratamientos por pieza dental del paciente.</p>
                                    </div>
                                    <div className="page-hero__icon"><Activity size={34} /></div>
                                </section>

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
                                <section className="page-hero" style={{ marginBottom: '20px' }}>
                                    <div>
                                        <span className="page-hero__label"><TrendingUp size={14} style={{ marginRight: '6px', display: 'inline' }} /> Seguimiento Clínico</span>
                                        <h2>Evolución y Tratamientos Odontológicos</h2>
                                        <p>Consulte el historial de tratamientos, atenciones subsecuentes y evolución odontológica continua de los pacientes.</p>
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
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            {selectedPatient && (
                                                <button
                                                    type="button"
                                                    className="action-button action-button--primary"
                                                    onClick={() => setIsEvolucionModalOpen(true)}
                                                >
                                                    <Plus size={14} /> Nueva Evolución
                                                </button>
                                            )}
                                            <button
                                                className="action-button action-button--accent"
                                                onClick={() => { setModalSearchCedula(''); setModalSearchResults([]); setIsPatientSearchOpen(true); }}
                                            >
                                                <Search size={14} /> Buscar Paciente
                                            </button>
                                        </div>
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
                                            <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '4px 0 0' }}>Consulte el seguimiento de tratamientos, citas subsecuentes y consultas dentales del paciente.</p>
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
                                                ) : !areaHistories.odontologia || areaHistories.odontologia.length === 0 ? (
                                                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontStyle: 'italic', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                        No se registran antecedentes en odontología.
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {/* Top bar with count & view mode toggle */}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                                {treatments.length} {treatments.length === 1 ? 'tratamiento registrado' : 'tratamientos registrados'} · {areaHistories.odontologia.length} {areaHistories.odontologia.length === 1 ? 'cita' : 'citas en total'}
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

                                                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                                                                                    <button
                                                                                        type="button"
                                                                                        className="action-button action-button--accent"
                                                                                        style={{ fontSize: '11px', padding: '4px 10px', minHeight: '28px', borderRadius: '7px', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleDownloadHistoriaClinicaPdf(selectedPatient.id_usuario || selectedPatient.id, treatment);
                                                                                        }}
                                                                                        title="Descargar Historia Clínica y Hoja de Evolución de este tratamiento"
                                                                                    >
                                                                                        <FileText size={13} /> PDF
                                                                                    </button>
                                                                                    <button
                                                                                        type="button"
                                                                                        className="action-button action-button--light"
                                                                                        style={{ fontSize: '11px', padding: '4px 10px', minHeight: '28px', borderRadius: '7px', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            toggleTreatment(treatment.id, treatment.estado === 'en_curso');
                                                                                        }}
                                                                                    >
                                                                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                                                        <span>{isExpanded ? 'Ocultar Citas' : `Desplegar Citas (${treatment.citas.length})`}</span>
                                                                                    </button>
                                                                                </div>
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
                                                                                                            title={cita.detalle_evolucion || cita.detalle_diagnostico || cita.procedimiento || 'Consulta registrada'}
                                                                                                        >
                                                                                                            {cita.detalle_evolucion || cita.detalle_diagnostico || cita.procedimiento || 'Consulta registrada'}
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
                                                                        {areaHistories.odontologia.map((record, index) => {
                                                                            const isPrimaria = record.tipo_atencion === 'primaria';
                                                                            return (
                                                                                <tr
                                                                                    key={record.id || index}
                                                                                    style={{
                                                                                        borderBottom: index === areaHistories.odontologia.length - 1 ? 'none' : '1px solid #f1f5f9',
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
                                                                                        title={record.detalle_evolucion || record.detalle_diagnostico || record.procedimiento || 'Ver detalles'}
                                                                                    >
                                                                                        {record.detalle_evolucion || record.detalle_diagnostico || record.procedimiento || 'Ver detalles'}
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
                                                                {activeBookRecord.recordTitle || (activeBookRecord.type === 'evolucion' ? 'Sesión de Evolución Dental' : 'Atención Odontológica')}
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
                                                                onClick={() => handleDownloadHistoriaClinicaPdf(selectedPatient.id_usuario || selectedPatient.id, activeBookRecord)}
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
                                                                    background: (activeBookRecord.tipo_atencion === 'primaria' || !activeBookRecord.tipo_atencion) ? 'var(--primary-soft)' : 'var(--accent-soft)',
                                                                    color: (activeBookRecord.tipo_atencion === 'primaria' || !activeBookRecord.tipo_atencion) ? 'var(--primary)' : 'var(--accent)',
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
                                                                    Diagnóstico Dental
                                                                </span>
                                                                <p style={{ margin: '3px 0 0', fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                                                                    {activeBookRecord.detalle_diagnostico || activeBookRecord.diagnostico}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Evolución / Notas Clínicas */}
                                                        {(activeBookRecord.detalle_evolucion || activeBookRecord.detalle_tratamiento || activeBookRecord.detalle_motivo) && (
                                                            <div style={{ background: '#f5f3ff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
                                                                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6d28d9', fontWeight: 700, display: 'block', letterSpacing: '0.4px' }}>
                                                                    Detalle de Evolución / Tratamiento
                                                                </span>
                                                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#3b0764', lineHeight: '1.5', fontStyle: 'italic' }}>
                                                                    {activeBookRecord.detalle_evolucion || activeBookRecord.detalle_tratamiento || activeBookRecord.detalle_motivo}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Procedimiento */}
                                                        {(activeBookRecord.procedimiento || activeBookRecord.detalle_procedimiento) && (
                                                            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block', letterSpacing: '0.4px' }}>
                                                                    Procedimiento Odontológico Realizado
                                                                </span>
                                                                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#334155', fontWeight: 600 }}>
                                                                    {activeBookRecord.procedimiento || activeBookRecord.detalle_procedimiento}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Prescripción */}
                                                        {(activeBookRecord.prescripcion_medica || activeBookRecord.prescripción_farmaceutica) && (
                                                            <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: '8px', border: '1px solid #99f6e4' }}>
                                                                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#0f766e', fontWeight: 700, display: 'block', letterSpacing: '0.4px' }}>
                                                                    Prescripción / Indicación Farmacéutica
                                                                </span>
                                                                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#134e4a', lineHeight: '1.4' }}>
                                                                    {activeBookRecord.prescripcion_medica || activeBookRecord.prescripción_farmaceutica}
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
                                            <div className="nurse-card__header" style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                                {/* FILA SUPERIOR: TÍTULO A LA IZQUIERDA Y FILTRO AL FRENTE (A LA DERECHA) */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                                                Inventario de Materiales Odontológicos
                                                            </h3>
                                                            <span style={{
                                                                fontSize: '11px',
                                                                fontWeight: '600',
                                                                color: 'var(--primary)',
                                                                background: 'var(--primary-soft, #e6f6f8)',
                                                                padding: '2px 8px',
                                                                borderRadius: '12px'
                                                            }}>
                                                                {insumosCatalogo.length} insumos
                                                            </span>
                                                        </div>
                                                        <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                                            Supervisa y administra las existencias actuales de cada insumo en clínica.
                                                        </p>
                                                    </div>

                                                    {/* BOTÓN: FILTROS AL FRENTE DEL TEXTO, ALINEADO A LA DERECHA */}
                                                    <div style={{ position: 'relative' }}>
                                                        <button
                                                            type="button"
                                                            className={`action-button ${onlyLowStockInsumos ? 'action-button--primary' : 'action-button--outline'}`}
                                                            onClick={() => setShowInsumoFilters(!showInsumoFilters)}
                                                            title={onlyLowStockInsumos ? "Filtros (Stock crítico activo)" : "Filtrar por stock crítico"}
                                                            aria-label="Filtrar insumos"
                                                            style={{
                                                                width: '36px',
                                                                height: '36px',
                                                                minHeight: '36px',
                                                                padding: 0,
                                                                display: 'grid',
                                                                placeItems: 'center',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                position: 'relative'
                                                            }}
                                                        >
                                                            <Filter size={16} />
                                                            {onlyLowStockInsumos && (
                                                                <span style={{
                                                                    position: 'absolute',
                                                                    top: '-3px',
                                                                    right: '-3px',
                                                                    background: '#dc2626',
                                                                    color: '#ffffff',
                                                                    borderRadius: '50%',
                                                                    width: '13px',
                                                                    height: '13px',
                                                                    display: 'grid',
                                                                    placeItems: 'center',
                                                                    fontSize: '8.5px',
                                                                    fontWeight: 'bold',
                                                                    border: '2px solid #ffffff'
                                                                }}>
                                                                    1
                                                                </span>
                                                            )}
                                                        </button>

                                                        {/* DROPDOWN FLOTANTE SUPERPUESTO (ALINEADO A LA DERECHA) */}
                                                        {showInsumoFilters && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: 'calc(100% + 8px)',
                                                                right: 0,
                                                                zIndex: 100,
                                                                width: '280px',
                                                                background: '#ffffff',
                                                                borderRadius: '12px',
                                                                border: '1px solid #cbd5e1',
                                                                boxShadow: '0 12px 28px -4px rgba(15,23,42,0.18), 0 4px 10px -2px rgba(15,23,42,0.08)',
                                                                padding: '14px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '12px',
                                                                animation: 'fadeIn 0.15s ease-in-out'
                                                            }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                                                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                                        <Filter size={12} color="var(--primary)" /> Filtros Disponibles
                                                                    </span>
                                                                    {onlyLowStockInsumos && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setOnlyLowStockInsumos(false)}
                                                                            style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                        >
                                                                            <X size={12} /> Limpiar
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setOnlyLowStockInsumos(!onlyLowStockInsumos)}
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            width: '100%',
                                                                            padding: '8px 10px',
                                                                            borderRadius: '8px',
                                                                            fontSize: '11.5px',
                                                                            fontWeight: '600',
                                                                            cursor: 'pointer',
                                                                            transition: 'all 0.2s ease',
                                                                            border: onlyLowStockInsumos ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                                                                            background: onlyLowStockInsumos ? '#fee2e2' : '#f8fafc',
                                                                            color: onlyLowStockInsumos ? '#991b1b' : '#334155'
                                                                        }}
                                                                    >
                                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                            <AlertTriangle size={13} style={{ color: onlyLowStockInsumos ? '#dc2626' : '#94a3b8' }} />
                                                                            Solo Stock Bajo / Crítico (≤ 5)
                                                                        </span>
                                                                        {onlyLowStockInsumos && <span style={{ fontSize: '11px', fontWeight: 'bold' }}>✓</span>}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* BARRA DE HERRAMIENTAS: TODO A LA IZQUIERDA (BUSCADOR + AÑADIR + REGISTRAR) */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-start',
                                                    flexWrap: 'wrap',
                                                    gap: '8px',
                                                    width: '100%'
                                                }}>
                                                    {/* BUSCADOR */}
                                                    <div className="patient-search-input" style={{ width: '280px', maxWidth: '100%', height: '36px', minHeight: '36px' }}>
                                                        <Search size={15} />
                                                        <input
                                                            type="text"
                                                            placeholder="Buscar por código, nombre o descripción..."
                                                            value={insumoSearchQuery}
                                                            onChange={(e) => setInsumoSearchQuery(e.target.value)}
                                                            style={{ fontSize: '12px' }}
                                                        />
                                                        {insumoSearchQuery && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setInsumoSearchQuery('')}
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', color: '#94a3b8' }}
                                                                title="Limpiar búsqueda"
                                                            >
                                                                <X size={13} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* BOTÓN: AÑADIR INSUMO */}
                                                    <button
                                                        type="button"
                                                        className="action-button action-button--accent"
                                                        onClick={() => handleOpenAddInsumo()}
                                                        title="Añadir nuevo insumo"
                                                        aria-label="Añadir nuevo insumo"
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            minHeight: '36px',
                                                            padding: 0,
                                                            display: 'grid',
                                                            placeItems: 'center',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Package size={16} />
                                                    </button>

                                                    {/* BOTÓN: REGISTRAR CONSUMO */}
                                                    <button
                                                        type="button"
                                                        className="action-button action-button--primary"
                                                        onClick={() => handleOpenAssignInsumo()}
                                                        title="Registrar consumo a paciente"
                                                        aria-label="Registrar consumo a paciente"
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            minHeight: '36px',
                                                            padding: 0,
                                                            display: 'grid',
                                                            placeItems: 'center',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <PlusCircle size={16} />
                                                    </button>

                                                    {/* ETIQUETA ACTIVA SI ESTÁ FILTRADO */}
                                                    {onlyLowStockInsumos && (
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            padding: '4px 10px',
                                                            background: '#fee2e2',
                                                            color: '#991b1b',
                                                            border: '1px solid #fca5a5',
                                                            borderRadius: '16px',
                                                            fontSize: '11px',
                                                            fontWeight: 600
                                                        }}>
                                                            <AlertTriangle size={12} color="#dc2626" />
                                                            Solo Stock Bajo (≤ 5)
                                                            <button
                                                                type="button"
                                                                onClick={() => setOnlyLowStockInsumos(false)}
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', padding: '0 2px', display: 'flex' }}
                                                                title="Quitar filtro"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </span>
                                                    )}
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
                                                const itemsPerPage = 12;
                                                const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
                                                const currentPageSafe = Math.min(catalogCurrentPage, totalPages);
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

                                                        {renderMinimalistPagination(
                                                            currentPageSafe,
                                                            totalPages,
                                                            filtered.length,
                                                            itemsPerPage,
                                                            setCatalogCurrentPage
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
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                                                            <div style={{ width: '140px' }}>
                                                                <img src={logoBienestar} alt="Bienestar Universitario UEB" style={{ maxHeight: '52px', width: 'auto', objectFit: 'contain' }} />
                                                            </div>
                                                            <div style={{ textAlign: 'center', flex: 1 }}>
                                                                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Universidad Estatal de Bolívar</h2>
                                                                <h3 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', color: '#475569' }}>Bienestar Universitario</h3>
                                                                <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Consumo Diario de Materiales Odontológicos Unidad Operativa</h3>
                                                                <h4 style={{ margin: '0', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#1e293b' }}>Consumo Diario de Materiales e Insumos Odontológicos</h4>
                                                            </div>
                                                            <div style={{ width: '140px', textAlign: 'right', fontWeight: 'bold', fontSize: '12px', color: '#1e293b' }}>
                                                                ODONTOLOGÍA
                                                            </div>
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

                                {/* FILA DE KPIS Y MÉTRICAS DE PROCEDIMIENTOS */}
                                <section className="psycho-kpis" style={{ marginTop: '20px' }}>
                                    <div className="psycho-kpi-card">
                                        <div className="psycho-kpi-card__icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                                            <BriefcaseMedical size={20} />
                                        </div>
                                        <div className="psycho-kpi-card__info">
                                            <span>Total Procedimientos</span>
                                            <strong>{proceduresCatalog.length}</strong>
                                        </div>
                                    </div>

                                    <div className="psycho-kpi-card">
                                        <div className="psycho-kpi-card__icon" style={{ background: '#e9f8f2', color: 'var(--success)' }}>
                                            <CheckCircle size={20} />
                                        </div>
                                        <div className="psycho-kpi-card__info">
                                            <span>Activos en Catálogo</span>
                                            <strong style={{ color: 'var(--success)' }}>
                                                {proceduresCatalog.length}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="psycho-kpi-card">
                                        <div className="psycho-kpi-card__icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                                            <Search size={20} />
                                        </div>
                                        <div className="psycho-kpi-card__info">
                                            <span>{procedureSearchQuery.trim() ? 'Coincidencias de Búsqueda' : 'Catálogo Disponible'}</span>
                                            <strong>
                                                {proceduresCatalog.filter(p => (p.nombre_procedimiento || '').toLowerCase().includes(procedureSearchQuery.toLowerCase())).length}
                                            </strong>
                                        </div>
                                    </div>
                                </section>

                                <section className="module-grid" style={{ marginTop: '20px' }}>
                                    <article className="nurse-card span-12">
                                        <div className="nurse-card__header" style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border)', textAlign: 'left', alignItems: 'flex-start' }}>
                                            {/* TÍTULO A LA IZQUIERDA */}
                                            <div style={{ textAlign: 'left', width: '100%' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                                        Catálogo de Procedimientos Odontológicos
                                                    </h3>
                                                    <span style={{
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        color: 'var(--primary)',
                                                        background: 'var(--primary-soft, #e6f6f8)',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px'
                                                    }}>
                                                        {proceduresCatalog.length} procedimientos
                                                    </span>
                                                </div>
                                                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    Agrega nuevos procedimientos dentales y administra el catálogo actual del odontólogo.
                                                </p>
                                            </div>

                                            {/* BARRA DE HERRAMIENTAS: TODO A LA IZQUIERDA */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'flex-start',
                                                flexWrap: 'wrap',
                                                gap: '8px',
                                                width: '100%'
                                            }}>
                                                {/* BUSCADOR */}
                                                <div className="patient-search-input" style={{ width: '280px', maxWidth: '100%', height: '36px', minHeight: '36px' }}>
                                                    <Search size={15} />
                                                    <input
                                                        type="text"
                                                        value={procedureSearchQuery}
                                                        onChange={(e) => setProcedureSearchQuery(e.target.value)}
                                                        placeholder="Buscar procedimiento..."
                                                        style={{ fontSize: '12px' }}
                                                    />
                                                    {procedureSearchQuery && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setProcedureSearchQuery('')}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', color: '#94a3b8' }}
                                                            title="Limpiar búsqueda"
                                                        >
                                                            <X size={13} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* FORMULARIO PARA AGREGAR NUEVO PROCEDIMIENTO */}
                                                <form onSubmit={handleAddProcedure} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <div className="patient-search-input" style={{ width: '280px', maxWidth: '100%', height: '36px', minHeight: '36px' }}>
                                                        <BriefcaseMedical size={15} />
                                                        <input
                                                            type="text"
                                                            value={newProcedureName}
                                                            onChange={(e) => setNewProcedureName(e.target.value)}
                                                            placeholder="Nuevo procedimiento (ej. Carillas)..."
                                                            required
                                                            style={{ fontSize: '12px' }}
                                                        />
                                                    </div>
                                                    <button
                                                        className="action-button action-button--accent"
                                                        type="submit"
                                                        title="Registrar nuevo procedimiento"
                                                        aria-label="Registrar procedimiento"
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            minHeight: '36px',
                                                            padding: 0,
                                                            display: 'grid',
                                                            placeItems: 'center',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </form>
                                            </div>
                                        </div>

                                        {procedureLoading ? (
                                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                                <span className="spinner"></span> Cargando catálogo de procedimientos...
                                            </div>
                                        ) : (() => {
                                            const filteredProcedures = proceduresCatalog.filter(p =>
                                                (p.nombre_procedimiento || '').toLowerCase().includes(procedureSearchQuery.toLowerCase())
                                            );
                                            const proceduresPerPage = 12;
                                            const totalProcedurePages = Math.max(1, Math.ceil(filteredProcedures.length / proceduresPerPage));
                                            const currentProcedurePageSafe = Math.min(procedureCurrentPage, totalProcedurePages);
                                            const paginatedProcedures = filteredProcedures.slice(
                                                (currentProcedurePageSafe - 1) * proceduresPerPage,
                                                currentProcedurePageSafe * proceduresPerPage
                                            );

                                            return (
                                                <>
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
                                                                {paginatedProcedures.map((proc, idx) => {
                                                                    const globalIdx = (currentProcedurePageSafe - 1) * proceduresPerPage + idx + 1;
                                                                    return (
                                                                        <tr key={proc.id || idx}>
                                                                            <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{globalIdx}</td>
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
                                                                                    style={{
                                                                                        background: '#fef2f2',
                                                                                        border: '1px solid #fca5a5',
                                                                                        color: '#dc2626',
                                                                                        borderRadius: '6px',
                                                                                        width: '28px',
                                                                                        height: '28px',
                                                                                        display: 'grid',
                                                                                        placeItems: 'center',
                                                                                        cursor: 'pointer',
                                                                                        margin: '0 auto'
                                                                                    }}
                                                                                    title="Eliminar procedimiento"
                                                                                    aria-label="Eliminar procedimiento"
                                                                                >
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                                {filteredProcedures.length === 0 && (
                                                                    <tr>
                                                                        <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                                                            No se encontraron procedimientos en el catálogo.
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {renderMinimalistPagination(
                                                        currentProcedurePageSafe,
                                                        totalProcedurePages,
                                                        filteredProcedures.length,
                                                        proceduresPerPage,
                                                        setProcedureCurrentPage
                                                    )}
                                                </>
                                            );
                                        })()}
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
                                                        <span style={{ color: '#fff', fontSize: '12.5px', fontWeight: 600 }}>Parte_Diario_Odontologia_{parteDiarioDate}.pdf</span>
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
                                                        title="Parte Diario Odontología"
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
                                                        <span style={{ color: '#fff', fontSize: '12.5px', fontWeight: 600 }}>Reporte_Consumo_Insumos_{reportInsumosFecha}.pdf</span>
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
                                                        ref={insumosIframeRef}
                                                        title="Reporte Insumos"
                                                        srcDoc={compileInsumosReportHtmlString()}
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
                                                        <span style={{ color: '#fff', fontSize: '12.5px', fontWeight: 600 }}>Reporte_Citas_Odontologia_{reportCitasFecha}.pdf</span>
                                                        <span style={{ color: '#94a3b8', fontSize: '10px' }}>Vista previa del documento oficial para impresión</span>
                                                    </div>
                                                </div>
                                                <button
                                                    className="action-button action-button--accent"
                                                    onClick={handlePrintReporteCitasRango}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '32px', fontSize: '11.5px', borderRadius: '8px', padding: '0 14px' }}
                                                >
                                                    <Printer size={14} /> Imprimir / Descargar
                                                </button>
                                            </div>
                                            <div style={{ background: '#334155', padding: '20px', display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
                                                {reportCitasLoading ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '500px', color: '#fff', gap: '12px' }}>
                                                        <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #fff', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
                                                        <span>Generando vista previa...</span>
                                                    </div>
                                                ) : (
                                                    <iframe
                                                        ref={citasIframeRef}
                                                        title="Reporte Citas Odontología"
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
                                                        <span style={{ color: '#fff', fontSize: '12.5px', fontWeight: 600 }}>Informe_Estadistico_Mensual_{["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][genReportMonth - 1]}_{genReportYear}.pdf</span>
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
                                                        ref={mensualIframeRef}
                                                        title="Informe General"
                                                        srcDoc={compileGeneralReportHtmlString(genReportData)}
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
                            </div>
                        )}

                        {/* PESTAÑA 6: GESTIÓN DE CITAS */}
                        {activeTab === 'citas' && (
                            <div className="citas-manager" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <section className="page-hero">
                                    <div>
                                        <span className="page-hero__label"><Calendar size={14} style={{ marginRight: '6px', display: 'inline' }} /> Control de Agenda</span>
                                        <h2>Agenda de Consultas de Odontología</h2>
                                        <p>Gestione las citas programadas, el control de asistencias y la agenda de atenciones odontológicas de estudiantes y funcionarios.</p>
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
                                    <div key={idx} className="patient-suggestion" style={{ gridTemplateColumns: '1fr auto', display: 'grid' }}>
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
                                                        <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
                                                            <Search size={15} color="var(--primary)" /> Buscar Medicamento en Catálogo de Farmacia
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
                                                    <button type="button" className="action-button action-button--accent" onClick={handleOpenCertModalFromStep7} disabled={fichaSaving} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

            {/* MODAL: OPCIONES DE CERTIFICADO (REPOSO / ASISTENCIA) */}
            {certModal.isOpen && createPortal(
                <div className="clinical-modal show" style={{ position: 'fixed', inset: 0, zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="clinical-modal__backdrop" onClick={() => !fichaSaving && setCertModal(prev => ({ ...prev, isOpen: false }))} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)' }}></div>
                    <div className="clinical-modal__dialog" style={{ maxWidth: '640px', width: '92%', borderRadius: '16px', overflow: 'hidden', position: 'relative', zIndex: 10, margin: 'auto', background: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={(e) => e.stopPropagation()}>
                        <header className="clinical-modal__header" style={{ background: 'var(--primary)', color: '#fff', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                    <FileCheck size={20} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#fff' }}>Emitir Certificado Odontológico</h2>
                                    <p style={{ fontSize: '12px', margin: '2px 0 0', color: 'rgba(255,255,255,0.8)' }}>
                                        {certModal.fromStep7 ? 'Guardar consulta y emitir certificado oficial' : 'Emisión de certificado oficial'}
                                    </p>
                                </div>
                            </div>
                            <button type="button" onClick={() => !fichaSaving && setCertModal(prev => ({ ...prev, isOpen: false }))} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px' }}>
                                <X size={18} />
                            </button>
                        </header>

                        <div className="clinical-modal__body" style={{ padding: '24px', maxHeight: '78vh', overflowY: 'auto' }}>
                            {/* SELECTOR DE OPCIONES: REPOSO O ASISTENCIA */}
                            <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '10px' }}>
                                Seleccione el Tipo de Certificado *
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                                {/* OPCIÓN 1: REPOSO */}
                                <div
                                    onClick={() => setCertModal(prev => ({ ...prev, tipo: 'reposo' }))}
                                    style={{
                                        border: `2px solid ${certModal.tipo === 'reposo' ? 'var(--primary)' : '#e2e8f0'}`,
                                        background: certModal.tipo === 'reposo' ? 'rgba(0, 32, 64, 0.04)' : '#ffffff',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Clock size={18} color={certModal.tipo === 'reposo' ? 'var(--primary)' : '#64748b'} />
                                            <strong style={{ fontSize: '13.5px', color: certModal.tipo === 'reposo' ? 'var(--primary)' : '#1e293b' }}>
                                                Certificado de Reposo
                                            </strong>
                                        </div>
                                        <input
                                            type="radio"
                                            name="certTipo"
                                            checked={certModal.tipo === 'reposo'}
                                            onChange={() => setCertModal(prev => ({ ...prev, tipo: 'reposo' }))}
                                            style={{ accentColor: 'var(--primary)' }}
                                        />
                                    </div>
                                    <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b', lineHeight: 1.4 }}>
                                        Justifica reposo médico/académico con horas de descanso y terapia antiinflamatoria.
                                    </p>
                                </div>

                                {/* OPCIÓN 2: ASISTENCIA */}
                                <div
                                    onClick={() => setCertModal(prev => ({ ...prev, tipo: 'asistencia' }))}
                                    style={{
                                        border: `2px solid ${certModal.tipo === 'asistencia' ? 'var(--primary)' : '#e2e8f0'}`,
                                        background: certModal.tipo === 'asistencia' ? 'rgba(0, 32, 64, 0.04)' : '#ffffff',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <CheckCircle size={18} color={certModal.tipo === 'asistencia' ? 'var(--primary)' : '#64748b'} />
                                            <strong style={{ fontSize: '13.5px', color: certModal.tipo === 'asistencia' ? 'var(--primary)' : '#1e293b' }}>
                                                Certificado de Asistencia
                                            </strong>
                                        </div>
                                        <input
                                            type="radio"
                                            name="certTipo"
                                            checked={certModal.tipo === 'asistencia'}
                                            onChange={() => setCertModal(prev => ({ ...prev, tipo: 'asistencia' }))}
                                            style={{ accentColor: 'var(--primary)' }}
                                        />
                                    </div>
                                    <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b', lineHeight: 1.4 }}>
                                        Constancia de atención clínica en el área dental sin requerimiento de reposo médico.
                                    </p>
                                </div>
                            </div>

                            {/* FORMULARIO DE DETALLES */}
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Información de la Constancia
                                </div>

                                {/* PACIENTE Y HORARIO */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                    <div>
                                        <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Paciente</span>
                                        <input
                                            type="text"
                                            value={selectedPatient?.nombre_completo || ''}
                                            disabled
                                            style={{ width: '100%', padding: '8px 10px', fontSize: '12.5px', background: '#e2e8f0', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: '600' }}
                                        />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Hora Inicio</span>
                                        <input
                                            type="text"
                                            value={certModal.horarioInicio}
                                            onChange={(e) => setCertModal(prev => ({ ...prev, horarioInicio: e.target.value }))}
                                            placeholder="Ej: 14h00 o 08h00"
                                            style={{ width: '100%', padding: '8px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                        />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Hora Fin</span>
                                        <input
                                            type="text"
                                            value={certModal.horarioFin}
                                            onChange={(e) => setCertModal(prev => ({ ...prev, horarioFin: e.target.value }))}
                                            placeholder="Ej: 14h20 o 08h30"
                                            style={{ width: '100%', padding: '8px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                        />
                                    </div>
                                </div>

                                {/* DIAGNÓSTICO Y CIE-10 */}
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                    <div>
                                        <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Diagnóstico Definitivo *</span>
                                        <input
                                            type="text"
                                            value={certModal.diagnostico}
                                            onChange={(e) => setCertModal(prev => ({ ...prev, diagnostico: e.target.value }))}
                                            placeholder="Ej: Raíz Dental Retenida, Pulpitis Irreversible..."
                                            style={{ width: '100%', padding: '8px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                        />
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Código CIE-10 (Opcional)</span>
                                        <input
                                            type="text"
                                            value={certModal.cie10}
                                            onChange={(e) => setCertModal(prev => ({ ...prev, cie10: e.target.value }))}
                                            placeholder="Ej: K008, Z040, K021"
                                            style={{ width: '100%', padding: '8px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                        />
                                    </div>
                                </div>

                                {/* CAMPOS ESPECÍFICOS SEGÚN EL TIPO */}
                                {certModal.tipo === 'reposo' ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
                                        <div>
                                            <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Pieza Dental (Opcional)</span>
                                            <input
                                                type="text"
                                                value={certModal.piezaDental}
                                                onChange={(e) => setCertModal(prev => ({ ...prev, piezaDental: e.target.value }))}
                                                placeholder="Ej: 35, 46, 18..."
                                                style={{ width: '100%', padding: '8px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                            />
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Tiempo de Reposo *</span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <input
                                                    type="text"
                                                    value={certModal.tiempoReposo}
                                                    onChange={(e) => setCertModal(prev => ({ ...prev, tiempoReposo: e.target.value }))}
                                                    placeholder="Ej: 48 horas"
                                                    style={{ flex: 1, padding: '8px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                                />
                                                {['24 horas', '48 horas', '72 horas'].map(preset => (
                                                    <button
                                                        key={preset}
                                                        type="button"
                                                        onClick={() => setCertModal(prev => ({ ...prev, tiempoReposo: preset }))}
                                                        style={{
                                                            fontSize: '11px',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #cbd5e1',
                                                            background: certModal.tiempoReposo === preset ? 'var(--primary)' : '#fff',
                                                            color: certModal.tiempoReposo === preset ? '#fff' : '#334155',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {preset}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <span style={{ fontSize: '11.5px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>Procedimiento Realizado *</span>
                                        <input
                                            type="text"
                                            value={certModal.procedimiento}
                                            onChange={(e) => setCertModal(prev => ({ ...prev, procedimiento: e.target.value }))}
                                            placeholder="Ej: restauración provisional en la pieza dental 46, profilaxis dental..."
                                            style={{ width: '100%', padding: '8px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* VISTA PREVIA DEL TEXTO OFICIAL */}
                            <div style={{ background: '#f1f5f9', borderLeft: '4px solid var(--primary)', padding: '12px 16px', borderRadius: '6px', fontSize: '12px', color: '#334155', lineHeight: 1.6 }}>
                                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                                    Vista previa del texto a imprimir:
                                </strong>
                                {certModal.tipo === 'reposo' ? (
                                    <span>
                                        Por medio de la presente certifico haber atendido al paciente <strong>{selectedPatient?.nombre_completo || '—'}</strong>, con cédula de identidad <strong>{selectedPatient?.cedula || selectedPatient?.numero_cedula || '—'}</strong>, es atendido en el horario de <strong>{certModal.horarioInicio} a {certModal.horarioFin}</strong>, por presentar odontalgia con Diagnóstico Definitivo <strong>{certModal.diagnostico || 'Odontalgia'}{certModal.cie10 ? ` (${certModal.cie10.trim()})` : ''}</strong>{certModal.piezaDental ? `, Pieza Dental ${certModal.piezaDental.trim()}` : ''}. Necesita reposo de <strong>{certModal.tiempoReposo}</strong> para su pronta recuperación, se acompaña terapia antiinflamatoria.
                                    </span>
                                ) : (
                                    <span>
                                        Por medio de la presente certifico haber atendido al paciente <strong>{selectedPatient?.nombre_completo || '—'}</strong>, con cédula de identidad <strong>{selectedPatient?.cedula || selectedPatient?.numero_cedula || '—'}</strong>, es atendido en el horario de <strong>{certModal.horarioInicio} a {certModal.horarioFin}</strong>, por presentar odontalgia con Diagnóstico Definitivo <strong>{certModal.diagnostico || 'Odontalgia'}{certModal.cie10 ? ` (${certModal.cie10.trim()})` : ''}</strong>, Se realiza <strong>{certModal.procedimiento || 'Evaluación Odontológica'}</strong>, <strong>NO NECESITA REPOSO</strong>.
                                    </span>
                                )}
                            </div>
                        </div>

                        <footer className="clinical-modal__actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid var(--border)', background: '#fff' }}>
                            <button type="button" className="action-button action-button--light" onClick={() => setCertModal(prev => ({ ...prev, isOpen: false }))} disabled={fichaSaving}>
                                Cancelar
                            </button>
                            <button type="button" className="action-button action-button--primary" onClick={handleConfirmEmitirCertificado} disabled={fichaSaving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Printer size={16} /> {fichaSaving ? 'Guardando...' : (certModal.fromStep7 ? 'Guardar y Emitir Certificado' : 'Imprimir Certificado')}
                            </button>
                        </footer>
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
                                    <div className="preview-sheet" style={{ position: 'relative', minHeight: '297mm', padding: '15mm 18mm 25mm 18mm' }}>
                                        {/* Banner Institucional Superior */}
                                        <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                                            <img src={headerBienestar} alt="UEB | Bienestar Universitario" style={{ width: '100%', maxHeight: '48px', objectFit: 'contain' }} />
                                        </div>

                                        {/* Tabla de Control y Datos Generales */}
                                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px', fontFamily: 'Arial, sans-serif', border: '1px solid #4b5563' }}>
                                            <tbody>
                                                {/* Fila 1: Logo UEB | Nombre Institución | Versión y Página */}
                                                <tr>
                                                    <td style={{ width: '18%', textAlign: 'center', verticalAlign: 'middle', padding: '6px 8px', border: '1px solid #4b5563', background: '#fff' }}>
                                                        <img src={logoUebTexto} alt="UEB" style={{ maxHeight: '38px', width: 'auto', maxWidth: '95%', objectFit: 'contain' }} />
                                                    </td>
                                                    <td colSpan={3} style={{ width: '60%', textAlign: 'center', verticalAlign: 'middle', padding: '6px 8px', border: '1px solid #4b5563', background: '#fff' }}>
                                                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e3a8a', lineHeight: 1.2 }}>Universidad Estatal de Bolívar</div>
                                                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#3b82f6', marginTop: '3px' }}>Informe General</div>
                                                    </td>
                                                    <td style={{ width: '22%', padding: 0, verticalAlign: 'middle', border: '1px solid #4b5563', background: '#fff' }}>
                                                        <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', fontSize: '8px', border: 'none', margin: 0 }}>
                                                            <tbody>
                                                                <tr>
                                                                    <td style={{ width: '50%', borderRight: '1px solid #4b5563', borderBottom: '1px solid #4b5563', padding: '4px', fontWeight: 'bold', textAlign: 'center', color: '#1e293b' }}>VERSIÓN:</td>
                                                                    <td style={{ width: '50%', borderBottom: '1px solid #4b5563', padding: '4px', textAlign: 'center' }}>1.0</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ width: '50%', borderRight: '1px solid #4b5563', borderBottom: 'none', padding: '4px', fontWeight: 'bold', textAlign: 'center', color: '#1e293b' }}>PÁGINA:</td>
                                                                    <td style={{ width: '50%', borderBottom: 'none', padding: '4px', textAlign: 'center' }}>
                                                                        <sup>1</sup> de 8
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>

                                                {/* Fila 2: DATOS GENERALES */}
                                                <tr>
                                                    <td colSpan={5} style={{ backgroundColor: '#cbd5e1', textAlign: 'center', padding: '4px', fontWeight: 'bold', fontSize: '10.5px', color: '#1e3a8a', border: '1px solid #4b5563', textTransform: 'uppercase' }}>
                                                        DATOS GENERALES
                                                    </td>
                                                </tr>

                                                {/* Fila 3: Fecha de Informe & No. De Informe */}
                                                <tr style={{ fontSize: '8.5px' }}>
                                                    <td style={{ backgroundColor: '#e2e8f0', border: '1px solid #4b5563', padding: '4px 6px', fontWeight: 500, width: '18%' }}>Fecha de Informe:</td>
                                                    <td style={{ border: '1px solid #4b5563', padding: '4px 6px', textAlign: 'center', width: '20%' }}>
                                                        {`${String(new Date(genReportYear, genReportMonth, 0).getDate()).padStart(2, '0')}/${String(genReportMonth).padStart(2, '0')}/${genReportYear}`}
                                                    </td>
                                                    <td style={{ backgroundColor: '#e2e8f0', border: '1px solid #4b5563', padding: '4px 6px', fontWeight: 500, width: '15%' }}>No. De Informe</td>
                                                    <td colSpan={2} style={{ border: '1px solid #4b5563', padding: '4px 6px', textAlign: 'center', width: '47%' }}>006-OD-{genReportYear}</td>
                                                </tr>

                                                {/* Fila 4: Funcionario Responsable de Informe */}
                                                <tr style={{ fontSize: '8.5px', backgroundColor: '#e2e8f0' }}>
                                                    <td rowSpan={3} style={{ border: '1px solid #4b5563', padding: '4px 6px', verticalAlign: 'middle', fontWeight: 500, width: '18%' }}>Funcionario Responsable de Informe</td>
                                                    <td rowSpan={2} style={{ border: '1px solid #4b5563', padding: '4px 6px', verticalAlign: 'middle', textAlign: 'left', fontWeight: 500, width: '20%' }}>Nombre</td>
                                                    <td colSpan={2} style={{ border: '1px solid #4b5563', padding: '3px', textAlign: 'center', fontWeight: 500, width: '40%' }}>Contacto</td>
                                                    <td rowSpan={2} style={{ border: '1px solid #4b5563', padding: '4px 6px', verticalAlign: 'middle', textAlign: 'left', fontWeight: 500, width: '22%' }}>Cargo</td>
                                                </tr>

                                                {/* Fila 5: Extensión Telefónica y Correo Electrónico sub-headers */}
                                                <tr style={{ fontSize: '7.5px', backgroundColor: '#e2e8f0' }}>
                                                    <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'left', fontWeight: 500, width: '15%' }}>Extensión Telefónica</td>
                                                    <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'left', fontWeight: 500, width: '25%' }}>Correo Electrónico</td>
                                                </tr>

                                                {/* Fila 6: Datos del Funcionario */}
                                                <tr style={{ fontSize: '8px' }}>
                                                    <td style={{ border: '1px solid #4b5563', padding: '5px', textAlign: 'left' }}>{user?.name || 'Andrea García León'}</td>
                                                    <td style={{ border: '1px solid #4b5563', padding: '5px', textAlign: 'center' }}>167 &nbsp; 168 &nbsp; 169</td>
                                                    <td style={{ border: '1px solid #4b5563', padding: '5px', textAlign: 'left' }}>{user?.email || 'angarcia@ueb.edu.ec'}</td>
                                                    <td style={{ border: '1px solid #4b5563', padding: '5px', textAlign: 'left' }}>Odontóloga de Bienestar Universitario</td>
                                                </tr>

                                                {/* Fila 7: Informe dirigido a: */}
                                                <tr style={{ fontSize: '8.5px', backgroundColor: '#e2e8f0' }}>
                                                    <td rowSpan={3} style={{ border: '1px solid #4b5563', padding: '4px 6px', verticalAlign: 'middle', fontWeight: 500, width: '18%' }}>Informe dirigido a:</td>
                                                    <td rowSpan={2} style={{ border: '1px solid #4b5563', padding: '4px 6px', verticalAlign: 'middle', textAlign: 'left', fontWeight: 500, width: '20%' }}>Nombre</td>
                                                    <td colSpan={2} style={{ border: '1px solid #4b5563', padding: '3px', textAlign: 'center', fontWeight: 500, width: '40%' }}>Contacto</td>
                                                    <td rowSpan={2} style={{ border: '1px solid #4b5563', padding: '4px 6px', verticalAlign: 'middle', textAlign: 'left', fontWeight: 500, width: '22%' }}>Cargo</td>
                                                </tr>

                                                {/* Fila 8: Extensión Telefónica y Correo Electrónico sub-headers */}
                                                <tr style={{ fontSize: '7.5px', backgroundColor: '#e2e8f0' }}>
                                                    <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'left', fontWeight: 500, width: '15%' }}>Extensión Telefónica</td>
                                                    <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'left', fontWeight: 500, width: '25%' }}>Correo Electrónico</td>
                                                </tr>

                                                {/* Fila 9: Datos del Destinatario */}
                                                <tr style={{ fontSize: '8px' }}>
                                                    <td style={{ border: '1px solid #4b5563', padding: '5px', textAlign: 'left' }}>Michel Gaibor Vásquez</td>
                                                    <td style={{ border: '1px solid #4b5563', padding: '5px', textAlign: 'center' }}>167 &nbsp; 168 &nbsp; 169</td>
                                                    <td style={{ border: '1px solid #4b5563', padding: '5px', textAlign: 'left' }}>sgaibor@ueb.gob.ec</td>
                                                    <td style={{ border: '1px solid #4b5563', padding: '5px', textAlign: 'left' }}>Coordinadora de Bienestar Universitario</td>
                                                </tr>

                                                {/* Fila 10: ASUNTO */}
                                                <tr>
                                                    <td colSpan={5} style={{ backgroundColor: '#eee9f6', border: '1px solid #4b5563', padding: '5px 8px', fontSize: '8.5px', textAlign: 'left' }}>
                                                        <strong>ASUNTO:</strong> Informe mensual de atenciones odontológicas del mes de {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][genReportMonth - 1].toLowerCase()}.
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Sección 1: ANTECEDENTES */}
                                        <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '14px', marginBottom: '6px', textTransform: 'uppercase', color: '#000' }}>
                                            1. ANTECEDENTES
                                        </div>
                                        <p style={{ fontSize: '8.5px', lineHeight: 1.4, textAlign: 'justify', marginBottom: '8px', color: '#000' }}>
                                            Bienestar Universitario, fue creado mediante resolución del Honorable Consejo Estudiantil en el año 1990 en conjunto con los demás departamentos que conforman la estructura administrativa de la institución. Dentro de su organización interna, se la concibió como un departamento de atención médica, odontológica, psicológica y servicio social dirigido a los miembros de la comunidad universitaria.
                                        </p>
                                        <p style={{ fontSize: '8.5px', lineHeight: 1.4, textAlign: 'justify', marginBottom: '12px', color: '#000' }}>
                                            Bienestar Universitario, a través del área de odontología brinda atención diaria a la comunidad universitaria, conformada por estudiantes, docentes y personal administrativo, asegurando la prestación continua y eficiente en la atención preventiva y curativa a los usuarios.
                                        </p>

                                        {/* Sección 2: ACTIVIDADES */}
                                        <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '14px', marginBottom: '6px', textTransform: 'uppercase', color: '#000' }}>
                                            2. ACTIVIDADES
                                        </div>
                                        <div style={{ fontSize: '8.5px', lineHeight: 1.45, color: '#000', marginBottom: '14px', paddingLeft: '5px' }}>
                                            <div>• Promoción de la salud buco-dental</div>
                                            <div>• Atención Preventiva.</div>
                                            <div>• Atención Curativa o Morbilidad.</div>
                                            <div>• Tratamiento y procedimientos oportuno</div>
                                            <div>• Elaboración de Historia Clínica Odontológica a los pacientes.</div>
                                            <div>• Registro de atenciones.</div>
                                            <div>• Elaboración del informe mensual de actividades.</div>
                                        </div>

                                        {/* Sección 3: ANÁLISIS DE RESULTADOS */}
                                        <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '14px', marginBottom: '8px', textTransform: 'uppercase', color: '#000' }}>
                                            3. ANÁLISIS DE RESULTADOS
                                        </div>
                                        <table style={{ width: '250px', borderCollapse: 'collapse', marginLeft: '140px', marginBottom: '25px', border: '1px solid #4b5563', fontFamily: 'Arial, sans-serif' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#cbd5e1', fontSize: '8.5px', fontWeight: 'bold' }}>
                                                    <th style={{ border: '1px solid #4b5563', padding: '4px 8px', textAlign: 'left', width: '65%' }}>COMUNIDAD UNIVERSITARIA</th>
                                                    <th style={{ border: '1px solid #4b5563', padding: '4px 8px', textAlign: 'center', width: '35%' }}>TOTAL</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ fontSize: '8.5px' }}>
                                                <tr>
                                                    <td style={{ border: '1px solid #4b5563', padding: '3px 8px', textAlign: 'left' }}>ESTUDIANTES</td>
                                                    <td style={{ border: '1px solid #4b5563', padding: '3px 8px', textAlign: 'center' }}>{genReportData.totalEstudiantes}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: '1px solid #4b5563', padding: '3px 8px', textAlign: 'left' }}>ADMINISTRATIVOS</td>
                                                    <td style={{ border: '1px solid #4b5563', padding: '3px 8px', textAlign: 'center' }}>{genReportData.totalAdministrativos}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: '1px solid #4b5563', padding: '3px 8px', textAlign: 'left' }}>DOCENTES</td>
                                                    <td style={{ border: '1px solid #4b5563', padding: '3px 8px', textAlign: 'center' }}>{genReportData.totalDocentes}</td>
                                                </tr>
                                                <tr style={{ backgroundColor: '#cbd5e1', fontWeight: 'bold' }}>
                                                    <td style={{ border: '1px solid #4b5563', padding: '3px 8px', textAlign: 'left' }}>TOTAL</td>
                                                    <td style={{ border: '1px solid #4b5563', padding: '3px 8px', textAlign: 'center' }}>{genReportData.totalPacientes}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Pie de Página Institucional */}
                                        <div style={{ position: 'absolute', bottom: '12mm', left: '18mm', right: '18mm' }}>
                                            <div style={{ borderTop: '1px solid #cbd5e1', marginBottom: '6px' }}></div>
                                            <div style={{ fontSize: '7.5px', lineHeight: 1.3, color: '#1e3a8a', textAlign: 'left', fontFamily: 'Arial, sans-serif' }}>
                                                <div>Dirección: &nbsp;Av. Ernesto Che Guevara y Gabriel Secaira</div>
                                                <div>Guaranda-Ecuador</div>
                                                <div>Teléfono: (593) 3220-6010 &nbsp;<strong>EXT 1168</strong></div>
                                                <div><strong>www.ueb.edu.ec</strong></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PÁGINA 2: DATOS POR GÉNERO Y FACULTADES (SALUD, JURISPRUDENCIA, ADMINISTRATIVAS) */}
                                    <div className="preview-sheet" style={{ position: 'relative', minHeight: '297mm', padding: '14mm 18mm 25mm 18mm', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
                                        {/* Banner Institucional Superior */}
                                        <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                                            <img src={headerBienestar} alt="UEB | Bienestar Universitario" style={{ width: '100%', maxHeight: '48px', objectFit: 'contain' }} />
                                        </div>

                                        {/* Párrafo introductorio */}
                                        <p style={{ fontSize: '8.5px', lineHeight: 1.35, textAlign: 'justify', margin: '0 0 8px 0', color: '#1e293b' }}>
                                            Las actividades realizadas durante el mes de {["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][genReportMonth - 1] || 'abril'} en las atenciones odontológicas a la Comunidad Universitaria dan un total de {genReportData.totalPacientes} pacientes, {genReportData.totalEstudiantes} estudiantes, {genReportData.totalAdministrativos} Administrativos y {genReportData.totalDocentes} Docentes.
                                        </p>

                                        {/* DATOS POR GÉNERO */}
                                        <div style={{ fontWeight: 'bold', fontSize: '9px', marginBottom: '5px', color: '#000' }}>
                                            DATOS POR GÉNERO:
                                        </div>

                                        {(() => {
                                            const totalH = (genReportData.genderCounts?.estudiantes?.hombres || 0) + (genReportData.genderCounts?.administrativos?.hombres || 0) + (genReportData.genderCounts?.docentes?.hombres || 0);
                                            const totalM = (genReportData.genderCounts?.estudiantes?.mujeres || 0) + (genReportData.genderCounts?.administrativos?.mujeres || 0) + (genReportData.genderCounts?.docentes?.mujeres || 0);
                                            const totalL = (genReportData.genderCounts?.estudiantes?.lgbti || 0) + (genReportData.genderCounts?.administrativos?.lgbti || 0) + (genReportData.genderCounts?.docentes?.lgbti || 0);

                                            return (
                                                <>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif', border: '1px solid #4b5563', marginBottom: '6px' }}>
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#cbd5e1', fontWeight: 'bold', fontSize: '8px', textAlign: 'center' }}>
                                                                <th style={{ border: '1px solid #4b5563', padding: '2px 6px', textAlign: 'left', width: '40%' }}>COMUNIDAD UNIVERSITARIA</th>
                                                                <th style={{ border: '1px solid #4b5563', padding: '2px 4px', width: '15%' }}>HOMBRES</th>
                                                                <th style={{ border: '1px solid #4b5563', padding: '2px 4px', width: '15%' }}>MUJERES</th>
                                                                <th style={{ border: '1px solid #4b5563', padding: '2px 4px', width: '15%' }}>LGBTI</th>
                                                                <th style={{ border: '1px solid #4b5563', padding: '2px 4px', width: '15%' }}>TOTAL</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr style={{ fontSize: '8px' }}>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 6px', textAlign: 'left' }}>ESTUDIANTES</td>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{genReportData.genderCounts?.estudiantes?.hombres || 0}</td>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{genReportData.genderCounts?.estudiantes?.mujeres || 0}</td>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{genReportData.genderCounts?.estudiantes?.lgbti || 0}</td>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center', fontWeight: 'bold' }}>{genReportData.totalEstudiantes || 0}</td>
                                                            </tr>
                                                            <tr style={{ fontSize: '8px' }}>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 6px', textAlign: 'left' }}>ADMINISTRATIVOS</td>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{genReportData.genderCounts?.administrativos?.hombres || 0}</td>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{genReportData.genderCounts?.administrativos?.mujeres || 0}</td>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{genReportData.genderCounts?.administrativos?.lgbti || 0}</td>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center', fontWeight: 'bold' }}>{genReportData.totalAdministrativos || 0}</td>
                                                            </tr>
                                                            <tr style={{ fontSize: '8px' }}>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 6px', textAlign: 'left' }}>DOCENTES</td>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{genReportData.genderCounts?.docentes?.hombres || 0}</td>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{genReportData.genderCounts?.docentes?.mujeres || 0}</td>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{genReportData.genderCounts?.docentes?.lgbti || 0}</td>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center', fontWeight: 'bold' }}>{genReportData.totalDocentes || 0}</td>
                                                            </tr>
                                                            <tr style={{ backgroundColor: '#cbd5e1', fontWeight: 'bold', fontSize: '8px' }}>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 6px', textAlign: 'left' }}>TOTAL</td>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{totalH}</td>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{totalM}</td>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{totalL}</td>
                                                                <td style={{ border: '1px solid #4b5563', padding: '2px 4px', textAlign: 'center' }}>{genReportData.totalPacientes || 0}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Narrativa Género */}
                                                    <p style={{ fontSize: '8.5px', lineHeight: 1.35, textAlign: 'justify', margin: '0 0 8px 0', color: '#1e293b' }}>
                                                        {buildGenderNarrative(genReportData.totalPacientes, genReportData.totalEstudiantes, genReportData.totalAdministrativos, genReportData.totalDocentes, genReportData.genderCounts)}
                                                    </p>
                                                </>
                                            );
                                        })()}

                                        {/* POR FACULTADES */}
                                        <div style={{ fontWeight: 'bold', fontSize: '9px', marginBottom: '5px', color: '#000' }}>
                                            POR FACULTADES:
                                        </div>

                                        {/* Facultad 1: CIENCIAS DE LA SALUD */}
                                        {renderFacultyTableJsx('CIENCIAS DE LA SALUD', genReportData.statsByFacultyAndCareer?.['CIENCIAS DE LA SALUD'])}
                                        <p style={{ fontSize: '8px', lineHeight: 1.35, textAlign: 'justify', margin: '0 0 6px 0', color: '#1e293b' }}>
                                            {buildFacultyNarrative('CIENCIAS DE LA SALUD', genReportData.statsByFacultyAndCareer?.['CIENCIAS DE LA SALUD'])}
                                        </p>

                                        {/* Facultad 2: JURISPRUDENCIA */}
                                        {renderFacultyTableJsx('JURISPRUDENCIA', genReportData.statsByFacultyAndCareer?.['JURISPRUDENCIA'])}
                                        <p style={{ fontSize: '8px', lineHeight: 1.35, textAlign: 'justify', margin: '0 0 6px 0', color: '#1e293b' }}>
                                            {buildFacultyNarrative('JURISPRUDENCIA', genReportData.statsByFacultyAndCareer?.['JURISPRUDENCIA'])}
                                        </p>

                                        {/* Facultad 3: CIENCIAS ADMINISTRATIVAS (Tabla) */}
                                        {renderFacultyTableJsx('CIENCIAS ADMINISTRATIVAS', genReportData.statsByFacultyAndCareer?.['CIENCIAS ADMINISTRATIVAS'])}

                                        {/* Pie de Página Institucional */}
                                        <div style={{ position: 'absolute', bottom: '12mm', left: '18mm', right: '18mm' }}>
                                            <div style={{ borderTop: '1px solid #cbd5e1', marginBottom: '6px' }}></div>
                                            <div style={{ fontSize: '7.5px', lineHeight: 1.3, color: '#1e3a8a', textAlign: 'left', fontFamily: 'Arial, sans-serif' }}>
                                                <div>Dirección: &nbsp;Av. Ernesto Che Guevara y Gabriel Secaira</div>
                                                <div>Guaranda-Ecuador</div>
                                                <div>Teléfono: (593) 3220-6010 &nbsp;<strong>EXT 1168</strong></div>
                                                <div><strong>www.ueb.edu.ec</strong></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PÁGINA 3: CONTINUACIÓN FACULTADES (ADMINISTRATIVAS NARRATIVA, AGROPECUARIAS, EDUCACIÓN, ATENCIONES PREVENTIVAS Y CURATIVAS) */}
                                    <div className="preview-sheet" style={{ position: 'relative', minHeight: '297mm', padding: '14mm 18mm 25mm 18mm', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
                                        {/* Banner Institucional Superior */}
                                        <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                                            <img src={headerBienestar} alt="UEB | Bienestar Universitario" style={{ width: '100%', maxHeight: '48px', objectFit: 'contain' }} />
                                        </div>

                                        {/* Narrativa CIENCIAS ADMINISTRATIVAS */}
                                        <p style={{ fontSize: '8px', lineHeight: 1.35, textAlign: 'justify', margin: '0 0 8px 0', color: '#1e293b' }}>
                                            {buildFacultyNarrative('CIENCIAS ADMINISTRATIVAS', genReportData.statsByFacultyAndCareer?.['CIENCIAS ADMINISTRATIVAS'])}
                                        </p>

                                        {/* Facultad 4: CIENCIAS AGROPECUARIAS */}
                                        {renderFacultyTableJsx('CIENCIAS AGROPECUARIAS', genReportData.statsByFacultyAndCareer?.['CIENCIAS AGROPECUARIAS'])}
                                        <p style={{ fontSize: '8px', lineHeight: 1.35, textAlign: 'justify', margin: '0 0 6px 0', color: '#1e293b' }}>
                                            {buildFacultyNarrative('CIENCIAS AGROPECUARIAS', genReportData.statsByFacultyAndCareer?.['CIENCIAS AGROPECUARIAS'])}
                                        </p>

                                        {/* Facultad 5: CIENCIAS DE LA EDUCACIÓN */}
                                        {renderFacultyTableJsx('CIENCIAS DE LA EDUCACIÓN', genReportData.statsByFacultyAndCareer?.['CIENCIAS DE LA EDUCACIÓN'])}
                                        <p style={{ fontSize: '8px', lineHeight: 1.35, textAlign: 'justify', margin: '0 0 6px 0', color: '#1e293b' }}>
                                            {buildFacultyNarrative('CIENCIAS DE LA EDUCACIÓN', genReportData.statsByFacultyAndCareer?.['CIENCIAS DE LA EDUCACIÓN'])}
                                        </p>

                                        {/* Sección ATENCIONES PREVENTIVAS */}
                                        <div style={{ fontWeight: 'bold', fontSize: '9px', marginTop: '14px', marginBottom: '6px', color: '#000', textTransform: 'uppercase' }}>
                                            ATENCIONES PREVENTIVAS
                                        </div>

                                        {(() => {
                                            const pExamen = genReportData.consolidadoStats?.preventivo?.['Examen Odontológico'] || {
                                                estudiantes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                                                administrativos: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 },
                                                docentes: { hombres: 0, mujeres: 0, lgbti: 0, total: 0 }
                                            };
                                            const pTotal = (pExamen.estudiantes?.total || 0) + (pExamen.administrativos?.total || 0) + (pExamen.docentes?.total || 0);

                                            return (
                                                <>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif', border: '1px solid #000', marginBottom: '6px', fontSize: '7.5px' }}>
                                                        <thead>
                                                            <tr style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fde9d9', padding: '2px 4px', width: '16%', color: '#000' }}>COMUNIDAD<br />UNIVERSITARIA</th>
                                                                <th colSpan={4} style={{ border: '1px solid #000', backgroundColor: '#fde9d9', padding: '2px 4px', width: '25%', color: '#000' }}>ESTUDIANTES</th>
                                                                <th colSpan={4} style={{ border: '1px solid #000', backgroundColor: '#fde9d9', padding: '2px 4px', width: '25%', color: '#000' }}>ADMINISTRATIVOS</th>
                                                                <th colSpan={4} style={{ border: '1px solid #000', backgroundColor: '#fde9d9', padding: '2px 4px', width: '25%', color: '#000' }}>DOCENTES</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#8db4e2', padding: '2px 4px', width: '9%', color: '#000' }}>TOTAL</th>
                                                            </tr>
                                                            <tr style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '7px' }}>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '2px 4px', color: '#000' }}>PREVENCIÓN</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '2px 2px', color: '#000' }}>MASCULINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '2px 2px', color: '#000' }}>FEMENINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '2px 2px', color: '#000' }}>LGBTI</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#d8e4bc', padding: '2px 2px', color: '#000' }}>TOTAL</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '2px 2px', color: '#000' }}>MASCULINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '2px 2px', color: '#000' }}>FEMENINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '2px 2px', color: '#000' }}>LGBTI</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#d8e4bc', padding: '2px 2px', color: '#000' }}>TOTAL</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '2px 2px', color: '#000' }}>MASCULINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '2px 2px', color: '#000' }}>FEMENINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '2px 2px', color: '#000' }}>LGBTI</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#d8e4bc', padding: '2px 2px', color: '#000' }}>TOTAL</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#8db4e2', padding: '2px 2px', color: '#000' }}>TOTAL</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr style={{ fontSize: '7.5px' }}>
                                                                <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'left' }}>Examen<br />Odontológico</td>
                                                                <td style={{ border: '1px solid #000', padding: '2px 2px', textAlign: 'center' }}>{pExamen.estudiantes?.hombres || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '2px 2px', textAlign: 'center' }}>{pExamen.estudiantes?.mujeres || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '2px 2px', textAlign: 'center' }}>{pExamen.estudiantes?.lgbti || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '2px 2px', textAlign: 'center', fontWeight: 'bold' }}>{pExamen.estudiantes?.total || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '2px 2px', textAlign: 'center' }}>{pExamen.administrativos?.hombres || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '2px 2px', textAlign: 'center' }}>{pExamen.administrativos?.mujeres || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '2px 2px', textAlign: 'center' }}>{pExamen.administrativos?.lgbti || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '2px 2px', textAlign: 'center', fontWeight: 'bold' }}>{pExamen.administrativos?.total || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '2px 2px', textAlign: 'center' }}>{pExamen.docentes?.hombres || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '2px 2px', textAlign: 'center' }}>{pExamen.docentes?.mujeres || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '2px 2px', textAlign: 'center' }}>{pExamen.docentes?.lgbti || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '2px 2px', textAlign: 'center', fontWeight: 'bold' }}>{pExamen.docentes?.total || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '2px 2px', textAlign: 'center', fontWeight: 'bold' }}>{pTotal}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Narrativa ATENCIONES PREVENTIVAS */}
                                                    <p style={{ fontSize: '8px', lineHeight: 1.35, margin: '4px 0 10px 0', color: '#000' }}>
                                                        <strong>Estudiantes:</strong> Examen Odontológicos a {pExamen.estudiantes?.hombres || 0} hombres y {pExamen.estudiantes?.mujeres || 0} mujeres.
                                                        {(pExamen.administrativos?.total || 0) > 0 && (
                                                            <> <strong>Administrativos:</strong> Examen Odontológico a {pExamen.administrativos?.hombres || 0} hombres y {pExamen.administrativos?.mujeres || 0} mujeres.</>
                                                        )}
                                                        {(pExamen.docentes?.total || 0) > 0 && (
                                                            <> <strong>Docentes:</strong> Examen Odontológico a {pExamen.docentes?.hombres || 0} hombres y {pExamen.docentes?.mujeres || 0} mujeres.</>
                                                        )}
                                                    </p>

                                                    {/* Sección ATENCIONES CURATIVAS (Encabezado de Tabla en Página 3) */}
                                                    <div style={{ fontWeight: 'bold', fontSize: '9px', marginTop: '10px', marginBottom: '6px', color: '#000', textTransform: 'uppercase' }}>
                                                        ATENCIONES CURATIVAS
                                                    </div>

                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif', border: '1px solid #000', marginBottom: '6px', fontSize: '7.5px' }}>
                                                        <thead>
                                                            <tr style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fde9d9', padding: '2px 4px', width: '16%', color: '#000' }}>COMUNIDAD<br />UNIVERSITARIA</th>
                                                                <th colSpan={4} style={{ border: '1px solid #000', backgroundColor: '#fde9d9', padding: '2px 4px', width: '25%', color: '#000' }}>ESTUDIANTES</th>
                                                                <th colSpan={4} style={{ border: '1px solid #000', backgroundColor: '#fde9d9', padding: '2px 4px', width: '25%', color: '#000' }}>ADMINISTRATIVOS</th>
                                                                <th colSpan={4} style={{ border: '1px solid #000', backgroundColor: '#fde9d9', padding: '2px 4px', width: '25%', color: '#000' }}>DOCENTES</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#8db4e2', padding: '2px 4px', width: '9%', color: '#000' }}>TOTAL</th>
                                                            </tr>
                                                        </thead>
                                                    </table>
                                                </>
                                            );
                                        })()}

                                        {/* Pie de Página Institucional */}
                                        <div style={{ position: 'absolute', bottom: '12mm', left: '18mm', right: '18mm' }}>
                                            <div style={{ borderTop: '1px solid #cbd5e1', marginBottom: '6px' }}></div>
                                            <div style={{ fontSize: '7.5px', lineHeight: 1.3, color: '#1e3a8a', textAlign: 'left', fontFamily: 'Arial, sans-serif' }}>
                                                <div>Dirección: &nbsp;Av. Ernesto Che Guevara y Gabriel Secaira</div>
                                                <div>Guaranda-Ecuador</div>
                                                <div>Teléfono: (593) 3220-6010 &nbsp;<strong>EXT 1168</strong></div>
                                                <div><strong>www.ueb.edu.ec</strong></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PÁGINA 4: ATENCIONES CURATIVAS (CONTINUACIÓN), PROCEDIMIENTOS PREVENTIVOS Y MORBILIDAD */}
                                    <div className="preview-sheet" style={{ position: 'relative', minHeight: '297mm', padding: '14mm 18mm 25mm 18mm', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
                                        {/* Banner Institucional Superior */}
                                        <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                                            <img src={headerBienestar} alt="UEB | Bienestar Universitario" style={{ width: '100%', maxHeight: '48px', objectFit: 'contain' }} />
                                        </div>

                                        {/* Tabla ATENCIONES CURATIVAS (Continuación de Página 3) */}
                                        {(() => {
                                            const curStats = genReportData.consolidadoStats?.curativo || {};
                                            const curDiags = genReportData.curativosDiagnoses || [];

                                            let totEstCurH = 0, totEstCurM = 0, totEstCurL = 0, totEstCurT = 0;
                                            let totAdmCurH = 0, totAdmCurM = 0, totAdmCurL = 0, totAdmCurT = 0;
                                            let totDocCurH = 0, totDocCurM = 0, totDocCurL = 0, totDocCurT = 0;
                                            let totGrandCurT = 0;

                                            const curRows = curDiags.map(diag => {
                                                const est = curStats[diag]?.estudiantes || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
                                                const adm = curStats[diag]?.administrativos || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
                                                const doc = curStats[diag]?.docentes || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };

                                                const estT = est.total || 0;
                                                const admT = adm.total || 0;
                                                const docT = doc.total || 0;
                                                const rowTotal = estT + admT + docT;

                                                totEstCurH += (est.hombres || 0);
                                                totEstCurM += (est.mujeres || 0);
                                                totEstCurL += (est.lgbti || 0);
                                                totEstCurT += estT;

                                                totAdmCurH += (adm.hombres || 0);
                                                totAdmCurM += (adm.mujeres || 0);
                                                totAdmCurL += (adm.lgbti || 0);
                                                totAdmCurT += admT;

                                                totDocCurH += (doc.hombres || 0);
                                                totDocCurM += (doc.mujeres || 0);
                                                totDocCurL += (doc.lgbti || 0);
                                                totDocCurT += docT;

                                                totGrandCurT += rowTotal;

                                                return (
                                                    <tr key={`cur-${diag}`} style={{ fontSize: '7px' }}>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 4px', textAlign: 'left' }}>{diag}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{est.hombres || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{est.mujeres || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{est.lgbti || 0}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', fontWeight: 'bold' }}>{estT}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{adm.hombres || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{adm.mujeres || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{adm.lgbti || 0}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', fontWeight: 'bold' }}>{admT}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{doc.hombres || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{doc.mujeres || ''}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{doc.lgbti || 0}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', fontWeight: 'bold' }}>{docT}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', fontWeight: 'bold' }}>{rowTotal}</td>
                                                    </tr>
                                                );
                                            });

                                            // Procedimientos preventivos
                                            const procPrev = genReportData.procPreventivos || {};
                                            const profE = procPrev['PROFILAXIS']?.estudiantes || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
                                            const profA = procPrev['PROFILAXIS']?.administrativos || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
                                            const profD = procPrev['PROFILAXIS']?.docentes || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
                                            const profET = profE.total || ((profE.hombres || 0) + (profE.mujeres || 0) + (profE.lgbti || 0));
                                            const profAT = profA.total || ((profA.hombres || 0) + (profA.mujeres || 0) + (profA.lgbti || 0));
                                            const profDT = profD.total || ((profD.hombres || 0) + (profD.mujeres || 0) + (profD.lgbti || 0));
                                            const profTotal = profET + profAT + profDT;

                                            const fluoE = procPrev['FLUORIZACIÓN']?.estudiantes || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
                                            const fluoA = procPrev['FLUORIZACIÓN']?.administrativos || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
                                            const fluoD = procPrev['FLUORIZACIÓN']?.docentes || { hombres: 0, mujeres: 0, lgbti: 0, total: 0 };
                                            const fluoET = fluoE.total || ((fluoE.hombres || 0) + (fluoE.mujeres || 0) + (fluoE.lgbti || 0));
                                            const fluoAT = fluoA.total || ((fluoA.hombres || 0) + (fluoA.mujeres || 0) + (fluoA.lgbti || 0));
                                            const fluoDT = fluoD.total || ((fluoD.hombres || 0) + (fluoD.mujeres || 0) + (fluoD.lgbti || 0));
                                            const fluoTotal = fluoET + fluoAT + fluoDT;

                                            const totProcH_E = (profE.hombres || 0) + (fluoE.hombres || 0);
                                            const totProcM_E = (profE.mujeres || 0) + (fluoE.mujeres || 0);
                                            const totProcL_E = (profE.lgbti || 0) + (fluoE.lgbti || 0);
                                            const totProcT_E = profET + fluoET;

                                            const totProcH_A = (profA.hombres || 0) + (fluoA.hombres || 0);
                                            const totProcM_A = (profA.mujeres || 0) + (fluoA.mujeres || 0);
                                            const totProcL_A = (profA.lgbti || 0) + (fluoA.lgbti || 0);
                                            const totProcT_A = profAT + fluoAT;

                                            const totProcH_D = (profD.hombres || 0) + (fluoD.hombres || 0);
                                            const totProcM_D = (profD.mujeres || 0) + (fluoD.mujeres || 0);
                                            const totProcL_D = (profD.lgbti || 0) + (fluoD.lgbti || 0);
                                            const totProcT_D = profDT + fluoDT;

                                            const totProcGrand = totProcT_E + totProcT_A + totProcT_D;

                                            const curativasNarrativeHtml = buildCurativasNarrative(curStats, curDiags);
                                            const procPrevNarrativeHtml = buildProcedimientosPreventivosNarrative(procPrev);

                                            return (
                                                <>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif', border: '1px solid #000', marginBottom: '6px', fontSize: '7px' }}>
                                                        <thead>
                                                            <tr style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '7px' }}>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '2px 4px', color: '#000', textAlign: 'left', width: '18%' }}>CURATIVO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000', width: '6%' }}>MASCULINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000', width: '6%' }}>FEMENINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000', width: '5%' }}>LGBTI</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#d8e4bc', padding: '1.5px 2px', color: '#000', width: '6%' }}>TOTAL</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000', width: '6%' }}>MASCULINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000', width: '6%' }}>FEMENINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000', width: '5%' }}>LGBTI</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#d8e4bc', padding: '1.5px 2px', color: '#000', width: '6%' }}>TOTAL</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000', width: '6%' }}>MASCULINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000', width: '6%' }}>FEMENINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000', width: '5%' }}>LGBTI</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#d8e4bc', padding: '1.5px 2px', color: '#000', width: '6%' }}>TOTAL</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#8db4e2', padding: '1.5px 2px', color: '#000', width: '8%' }}>TOTAL</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {curRows}
                                                            <tr style={{ backgroundColor: '#cbd5e1', fontWeight: 'bold', fontSize: '7px' }}>
                                                                <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'left' }}>TOTAL</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totEstCurH}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totEstCurM}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totEstCurL}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totEstCurT}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totAdmCurH}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totAdmCurM}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totAdmCurL}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totAdmCurT}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totDocCurH}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totDocCurM}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totDocCurL}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totDocCurT}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totGrandCurT}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Narrativa ATENCIONES CURATIVAS */}
                                                    <div
                                                        style={{ fontSize: '8px', lineHeight: 1.35, margin: '4px 0 10px 0', color: '#000', textAlign: 'justify' }}
                                                        dangerouslySetInnerHTML={{ __html: curativasNarrativeHtml }}
                                                    />

                                                    {/* Sección PROCEDIMIENTOS PREVENTIVOS */}
                                                    <div style={{ fontWeight: 'bold', fontSize: '9px', marginTop: '10px', marginBottom: '5px', color: '#000', textTransform: 'uppercase' }}>
                                                        PROCEDIMIENTOS PREVENTIVOS
                                                    </div>

                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif', border: '1px solid #000', marginBottom: '5px', fontSize: '7px' }}>
                                                        <thead>
                                                            <tr style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fde9d9', padding: '2px 4px', width: '18%', color: '#000', textAlign: 'left' }}>PROCEDIMIENTOS</th>
                                                                <th colSpan={4} style={{ border: '1px solid #000', backgroundColor: '#fde9d9', padding: '2px 4px', width: '23%', color: '#000' }}>ESTUDIANTES</th>
                                                                <th colSpan={4} style={{ border: '1px solid #000', backgroundColor: '#fde9d9', padding: '2px 4px', width: '23%', color: '#000' }}>ADMINISTRATIVOS</th>
                                                                <th colSpan={4} style={{ border: '1px solid #000', backgroundColor: '#fde9d9', padding: '2px 4px', width: '23%', color: '#000' }}>DOCENTES</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#8db4e2', padding: '2px 4px', width: '8%', color: '#000' }}>TOTAL</th>
                                                            </tr>
                                                            <tr style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 4px', color: '#000', textAlign: 'left' }}>PREVENCIÓN</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000' }}>MASCULINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000' }}>FEMENINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000' }}>LGBTI</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#d8e4bc', padding: '1.5px 2px', color: '#000' }}>TOTAL</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000', width: '6%' }}>MASCULINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000', width: '6%' }}>FEMENINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000', width: '5%' }}>LGBTI</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#d8e4bc', padding: '1.5px 2px', color: '#000', width: '6%' }}>TOTAL</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000', width: '6%' }}>MASCULINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000', width: '6%' }}>FEMENINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000', width: '5%' }}>LGBTI</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#d8e4bc', padding: '1.5px 2px', color: '#000', width: '6%' }}>TOTAL</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#8db4e2', padding: '1.5px 2px', color: '#000', width: '8%' }}>TOTAL</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 4px', textAlign: 'left' }}>PROFILAXIS</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{profE.hombres || ''}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{profE.mujeres || ''}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{profE.lgbti || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', fontWeight: 'bold' }}>{profET}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{profA.hombres || ''}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{profA.mujeres || ''}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{profA.lgbti || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', fontWeight: 'bold' }}>{profAT}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{profD.hombres || ''}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{profD.mujeres || ''}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{profD.lgbti || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', fontWeight: 'bold' }}>{profDT}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', fontWeight: 'bold' }}>{profTotal}</td>
                                                            </tr>
                                                            <tr>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 4px', textAlign: 'left' }}>FLUORIZACIÓN</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{fluoE.hombres || ''}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{fluoE.mujeres || ''}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{fluoE.lgbti || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', fontWeight: 'bold' }}>{fluoET}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{fluoA.hombres || ''}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{fluoA.mujeres || ''}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{fluoA.lgbti || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', fontWeight: 'bold' }}>{fluoAT}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{fluoD.hombres || ''}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{fluoD.mujeres || ''}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{fluoD.lgbti || 0}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', fontWeight: 'bold' }}>{fluoDT}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', fontWeight: 'bold' }}>{fluoTotal}</td>
                                                            </tr>
                                                            <tr style={{ backgroundColor: '#cbd5e1', fontWeight: 'bold', fontSize: '7px' }}>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 4px', textAlign: 'left' }}>TOTAL</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totProcH_E}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totProcM_E}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totProcL_E}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totProcT_E}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totProcH_A}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totProcM_A}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totProcL_A}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totProcT_A}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totProcH_D}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totProcM_D}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totProcL_D}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totProcT_D}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{totProcGrand}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Narrativa PROCEDIMIENTOS PREVENTIVOS */}
                                                    <div
                                                        style={{ fontSize: '8px', lineHeight: 1.35, margin: '4px 0 10px 0', color: '#000', textAlign: 'justify' }}
                                                        dangerouslySetInnerHTML={{ __html: procPrevNarrativeHtml }}
                                                    />

                                                    {/* Sección PROCEDIMIENTOS DE MORBILIDAD */}
                                                    <div style={{ fontWeight: 'bold', fontSize: '9px', marginTop: '10px', marginBottom: '5px', color: '#000', textTransform: 'uppercase' }}>
                                                        PROCEDIMIENTOS DE MORBILIDAD
                                                    </div>

                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif', border: '1px solid #000', marginBottom: '6px', fontSize: '7px' }}>
                                                        <thead>
                                                            <tr style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fde9d9', padding: '2px 4px', width: '18%', color: '#000', textAlign: 'left' }}>PROCEDIMIENTOS</th>
                                                                <th colSpan={4} style={{ border: '1px solid #000', backgroundColor: '#fde9d9', padding: '2px 4px', width: '23%', color: '#000' }}>ESTUDIANTES</th>
                                                                <th colSpan={4} style={{ border: '1px solid #000', backgroundColor: '#fde9d9', padding: '2px 4px', width: '23%', color: '#000' }}>ADMINISTRATIVOS</th>
                                                                <th colSpan={4} style={{ border: '1px solid #000', backgroundColor: '#fde9d9', padding: '2px 4px', width: '23%', color: '#000' }}>DOCENTES</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#8db4e2', padding: '2px 4px', width: '8%', color: '#000' }}>TOTAL</th>
                                                            </tr>
                                                            <tr style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 4px', color: '#000', textAlign: 'left' }}>MORBILIDAD</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000' }}>MASCULINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000' }}>FEMENINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000' }}>LGBTI</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#d8e4bc', padding: '1.5px 2px', color: '#000' }}>TOTAL</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000' }}>MASCULINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000' }}>FEMENINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000' }}>LGBTI</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#d8e4bc', padding: '1.5px 2px', color: '#000' }}>TOTAL</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000' }}>MASCULINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000' }}>FEMENINO</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#fcd5b4', padding: '1.5px 2px', color: '#000' }}>LGBTI</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#d8e4bc', padding: '1.5px 2px', color: '#000' }}>TOTAL</th>
                                                                <th style={{ border: '1px solid #000', backgroundColor: '#8db4e2', padding: '1.5px 2px', color: '#000' }}>TOTAL</th>
                                                            </tr>
                                                        </thead>
                                                    </table>
                                                </>
                                            );
                                        })()}

                                        {/* Pie de Página Institucional */}
                                        <div style={{ position: 'absolute', bottom: '12mm', left: '18mm', right: '18mm' }}>
                                            <div style={{ borderTop: '1px solid #cbd5e1', marginBottom: '6px' }}></div>
                                            <div style={{ fontSize: '7.5px', lineHeight: 1.3, color: '#1e3a8a', textAlign: 'left', fontFamily: 'Arial, sans-serif' }}>
                                                <div>Dirección: &nbsp;Av. Ernesto Che Guevara y Gabriel Secaira</div>
                                                <div>Guaranda-Ecuador</div>
                                                <div>Teléfono: (593) 3220-6010 &nbsp;<strong>EXT 1168</strong></div>
                                                <div><strong>www.ueb.edu.ec</strong></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PÁGINA 5: PROCEDIMIENTOS DE MORBILIDAD (CONTINUACIÓN), CONCLUSIONES, RECOMENDACIONES Y ANEXOS */}
                                    <div className="preview-sheet" style={{ position: 'relative', minHeight: '297mm', padding: '14mm 18mm 25mm 18mm', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
                                        {/* Banner Institucional Superior */}
                                        <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                                            <img src={headerBienestar} alt="UEB | Bienestar Universitario" style={{ width: '100%', maxHeight: '48px', objectFit: 'contain' }} />
                                        </div>

                                        {/* Tabla PROCEDIMIENTOS DE MORBILIDAD (Continuación de Página 4) */}
                                        {(() => {
                                            const pMor = genReportData.procMorbilidad || {};
                                            const morbilidadProcs = [
                                                'DESTARTRAJE',
                                                'RESTAURACIÓN PROVISIONAL',
                                                'RESTAURACIÓN CON RESINA',
                                                'DESGASTE DE PAREDES',
                                                'EXODONCIA',
                                                'RECETAS',
                                                'ORDEN DE RX',
                                                'RETIRO DE PUNTOS'
                                            ];

                                            let totEstMorH = 0, totEstMorM = 0, totEstMorL = 0, totEstMorT = 0;
                                            let totAdmMorH = 0, totAdmMorM = 0, totAdmMorL = 0, totAdmMorT = 0;
                                            let totDocMorH = 0, totDocMorM = 0, totDocMorL = 0, totDocMorT = 0;
                                            let totGrandMorT = 0;

                                            const morbilidadRows = morbilidadProcs.map(proc => {
                                                const est = pMor[proc]?.estudiantes || { hombres: 0, mujeres: 0, lgbti: 0 };
                                                const adm = pMor[proc]?.administrativos || { hombres: 0, mujeres: 0, lgbti: 0 };
                                                const doc = pMor[proc]?.docentes || { hombres: 0, mujeres: 0, lgbti: 0 };

                                                const estH = est.hombres || 0;
                                                const estM = est.mujeres || 0;
                                                const estL = est.lgbti || 0;
                                                const estT = estH + estM + estL;

                                                const admH = adm.hombres || 0;
                                                const admM = adm.mujeres || 0;
                                                const admL = adm.lgbti || 0;
                                                const admT = admH + admM + admL;

                                                const docH = doc.hombres || 0;
                                                const docM = doc.mujeres || 0;
                                                const docL = doc.lgbti || 0;
                                                const docT = docH + docM + docL;

                                                const rowTotal = estT + admT + docT;

                                                totEstMorH += estH;
                                                totEstMorM += estM;
                                                totEstMorL += estL;
                                                totEstMorT += estT;

                                                totAdmMorH += admH;
                                                totAdmMorM += admM;
                                                totAdmMorL += admL;
                                                totAdmMorT += admT;

                                                totDocMorH += docH;
                                                totDocMorM += docM;
                                                totDocMorL += docL;
                                                totDocMorT += docT;

                                                totGrandMorT += rowTotal;

                                                return (
                                                    <tr key={`mor-${proc}`} style={{ fontSize: '7px' }}>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 4px', textAlign: 'left', width: '18%' }}>{proc}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '6%' }}>{estH}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '6%' }}>{estM}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '5%' }}>{estL}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f2dcdb', width: '6%' }}>{estT}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '6%' }}>{admH}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '6%' }}>{admM}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '5%' }}>{admL}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f2dcdb', width: '6%' }}>{admT}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '6%' }}>{docH}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '6%' }}>{docM}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '5%' }}>{docL}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f2dcdb', width: '6%' }}>{docT}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f2dcdb', width: '8%' }}>{rowTotal}</td>
                                                    </tr>
                                                );
                                            });

                                            const procMorbilidadNarrativeHtml = buildProcedimientosMorbilidadNarrative(pMor);

                                            return (
                                                <>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif', border: '1px solid #000', marginBottom: '6px', fontSize: '7px' }}>
                                                        <tbody>
                                                            {morbilidadRows}
                                                            <tr style={{ fontWeight: 'bold', fontSize: '7px' }}>
                                                                <td style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'left', width: '18%' }}>TOTAL</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '6%' }}>{totEstMorH}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '6%' }}>{totEstMorM}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '5%' }}>{totEstMorL}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#f2dcdb', width: '6%' }}>{totEstMorT}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '6%' }}>{totAdmMorH}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '6%' }}>{totAdmMorM}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '5%' }}>{totAdmMorL}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#f2dcdb', width: '6%' }}>{totAdmMorT}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '6%' }}>{totDocMorH}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '6%' }}>{totDocMorM}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '5%' }}>{totDocMorL}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#f2dcdb', width: '6%' }}>{totDocMorT}</td>
                                                                <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#f2dcdb', width: '8%' }}>{totGrandMorT}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                    {/* Narrativa PROCEDIMIENTOS DE MORBILIDAD */}
                                                    <div
                                                        style={{ fontSize: '8px', lineHeight: 1.35, margin: '6px 0 14px 0', color: '#000', textAlign: 'justify' }}
                                                        dangerouslySetInnerHTML={{ __html: procMorbilidadNarrativeHtml }}
                                                    />

                                                    {/* 4. CONCLUSIONES */}
                                                    <div style={{ fontWeight: 'bold', fontSize: '9px', marginTop: '14px', marginBottom: '6px', textTransform: 'uppercase', color: '#000' }}>
                                                        4. CONCLUSIONES
                                                    </div>
                                                    <p style={{ fontSize: '8.5px', lineHeight: 1.4, textAlign: 'justify', margin: '0 0 14px 0', color: '#000' }}>
                                                        El Servicio de Odontología contribuye a garantizar la salud Buco-Dental de los miembros de la comunidad universitaria, lograr disminuir las patologías bucales con las atenciones preventivas, curativas, campañas de prevención y socialización que realizamos con las distintas carreras de nuestra universidad.
                                                    </p>

                                                    {/* 5. RECOMENDACIONES */}
                                                    <div style={{ fontWeight: 'bold', fontSize: '9px', marginTop: '14px', marginBottom: '6px', textTransform: 'uppercase', color: '#000' }}>
                                                        5. RECOMENDACIONES
                                                    </div>
                                                    <p style={{ fontSize: '8.5px', lineHeight: 1.4, textAlign: 'justify', margin: '0 0 4px 0', color: '#000' }}>
                                                        Fortalecer el Servicio de Odontológico de Bienestar Universitario con la compra oportuna de los insumos e instrumentos odontológicos solicitados por el área de odontología.
                                                    </p>
                                                    <p style={{ fontSize: '8.5px', lineHeight: 1.4, textAlign: 'justify', margin: '0 0 14px 0', color: '#000' }}>
                                                        Actualizar información de los servicios que brinda Bienestar Universitario en la página web de la Universidad Estatal de Bolívar.
                                                    </p>
                                                </>
                                            );
                                        })()}

                                        {/* Pie de Página Institucional */}
                                        <div style={{ position: 'absolute', bottom: '12mm', left: '18mm', right: '18mm' }}>
                                            <div style={{ borderTop: '1px solid #cbd5e1', marginBottom: '6px' }}></div>
                                            <div style={{ fontSize: '7.5px', lineHeight: 1.3, color: '#1e3a8a', textAlign: 'left', fontFamily: 'Arial, sans-serif' }}>
                                                <div>Dirección: &nbsp;Av. Ernesto Che Guevara y Gabriel Secaira</div>
                                                <div>Guaranda-Ecuador</div>
                                                <div>Teléfono: (593) 3220-6010 &nbsp;<strong>EXT 1168</strong></div>
                                                <div><strong>www.ueb.edu.ec</strong></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PÁGINA 6: ANEXOS (TABLA GENERAL DE ATENCIONES) */}
                                    <div className="preview-sheet" style={{ position: 'relative', minHeight: '297mm', padding: '12mm 18mm 25mm 18mm', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
                                        {/* 6. ANEXOS */}
                                        <div style={{ fontWeight: 'bold', fontSize: '9px', marginBottom: '6px', textTransform: 'uppercase', color: '#000' }}>
                                            6. ANEXOS
                                        </div>

                                        {/* Banner Institucional Superior */}
                                        <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                                            <img src={headerBienestar} alt="UEB | Bienestar Universitario" style={{ width: '100%', maxHeight: '44px', objectFit: 'contain' }} />
                                        </div>

                                        {/* Título de la tabla centrado */}
                                        <div style={{ fontWeight: 'bold', fontSize: '9.5px', textAlign: 'center', marginBottom: '8px', color: '#000', textTransform: 'uppercase' }}>
                                            ATENCIONES DE ODONTOLOGÍA - {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][genReportMonth - 1]?.toUpperCase() || 'ABRIL'} {genReportYear}
                                        </div>

                                        {/* Tabla General de Atenciones */}
                                        {(() => {
                                            const anexoFaculties = [
                                                {
                                                    faculty: 'CIENCIAS DE LA SALUD',
                                                    careers: ['Enfermería', 'Gestión de Riesgos', 'Psicología', 'Terapia Física']
                                                },
                                                {
                                                    faculty: 'JURISPRUDENCIA',
                                                    careers: ['Criminalística', 'Derecho', 'Sociología']
                                                },
                                                {
                                                    faculty: 'CIENCIAS ADMINISTRATIVAS',
                                                    careers: [
                                                        'Ad. Empresas',
                                                        'Comunicación',
                                                        'Cont. Auditoría',
                                                        'Emprendimiento e Innovación',
                                                        'Gestión del Talento Humano',
                                                        'Marketing Digital',
                                                        'Mercadotecnia',
                                                        'Software',
                                                        'Tecnología de la Informática',
                                                        'Turismo'
                                                    ]
                                                },
                                                {
                                                    faculty: 'CIENCIAS AGROPECUARIAS',
                                                    careers: ['Agroindustria', 'Agronomía', 'Med. Veterinaria']
                                                },
                                                {
                                                    faculty: 'CIENCIAS DE LA EDUCACIÓN',
                                                    careers: [
                                                        'Educación Básica',
                                                        'Educación Inicial',
                                                        'Educación Intercultural',
                                                        'Fisicomatemático',
                                                        'Pedagogía Idiomas Nacionales',
                                                        'Pedagogía de la Informática',
                                                        'Centro de Desarrollo Infantil'
                                                    ]
                                                }
                                            ];

                                            const estH = genReportData.genderCounts?.estudiantes?.hombres || 0;
                                            const estM = genReportData.genderCounts?.estudiantes?.mujeres || 0;
                                            const estL = genReportData.genderCounts?.estudiantes?.lgbti || 0;
                                            const estT = genReportData.totalEstudiantes || (estH + estM + estL);

                                            const admH = genReportData.genderCounts?.administrativos?.hombres || 0;
                                            const admM = genReportData.genderCounts?.administrativos?.mujeres || 0;
                                            const admL = genReportData.genderCounts?.administrativos?.lgbti || 0;
                                            const admT = genReportData.totalAdministrativos || (admH + admM + admL);

                                            const docH = genReportData.genderCounts?.docentes?.hombres || 0;
                                            const docM = genReportData.genderCounts?.docentes?.mujeres || 0;
                                            const docL = genReportData.genderCounts?.docentes?.lgbti || 0;
                                            const docT = genReportData.totalDocentes || (docH + docM + docL);

                                            const totH = estH + admH + docH;
                                            const totM = estM + admM + docM;
                                            const totL = estL + admL + docL;
                                            const grandTotalAnexo = estT + admT + docT;

                                            let isFirstEver = true;

                                            return (
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif', border: '1.5px solid #000', fontSize: '7.5px', marginBottom: '6px' }}>
                                                    <thead>
                                                        <tr style={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#d9d9d9' }}>
                                                            <th colSpan={2} style={{ border: '1px solid #000', padding: '2.5px 2px', width: '25.5%', color: '#000' }}>FACULTAD</th>
                                                            <th style={{ border: '1px solid #000', padding: '2.5px 2px', width: '34.5%', color: '#000' }}>CARRERA</th>
                                                            <th style={{ border: '1px solid #000', padding: '2.5px 2px', width: '10%', color: '#000' }}>HOMBRES</th>
                                                            <th style={{ border: '1px solid #000', padding: '2.5px 2px', width: '10%', color: '#000' }}>MUJERES</th>
                                                            <th style={{ border: '1px solid #000', padding: '2.5px 2px', width: '10%', color: '#000' }}>LGBTI</th>
                                                            <th style={{ border: '1px solid #000', padding: '2.5px 2px', width: '10%', color: '#000' }}>TOTAL</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {anexoFaculties.map((facGroup) => {
                                                            const facName = facGroup.faculty;
                                                            const careers = facGroup.careers;
                                                            const facRowspan = careers.length;

                                                            return careers.map((careerName, idx) => {
                                                                const stats = genReportData.statsByFacultyAndCareer?.[facName]?.[careerName] || {
                                                                    hombres: 0,
                                                                    mujeres: 0,
                                                                    lgbti: 0,
                                                                    total: 0
                                                                };

                                                                const showEstCell = isFirstEver;
                                                                if (isFirstEver) isFirstEver = false;

                                                                return (
                                                                    <tr key={`anexo-${facName}-${careerName}`} style={{ fontSize: '7.5px' }}>
                                                                        {showEstCell && (
                                                                            <td
                                                                                rowSpan={27}
                                                                                style={{
                                                                                    border: '1px solid #000',
                                                                                    backgroundColor: '#d9d9d9',
                                                                                    width: '3.5%',
                                                                                    textAlign: 'center',
                                                                                    verticalAlign: 'middle',
                                                                                    fontWeight: 'bold',
                                                                                    fontSize: '7.5px',
                                                                                    lineHeight: 1.15,
                                                                                    padding: '2px 0'
                                                                                }}
                                                                            >
                                                                                E<br/>S<br/>T<br/>U<br/>D<br/>I<br/>A<br/>N<br/>T<br/>E<br/>S
                                                                            </td>
                                                                        )}
                                                                        {idx === 0 && (
                                                                            <td
                                                                                rowSpan={facRowspan}
                                                                                style={{
                                                                                    border: '1px solid #000',
                                                                                    backgroundColor: '#d9d9d9',
                                                                                    fontWeight: 'bold',
                                                                                    textAlign: 'center',
                                                                                    verticalAlign: 'middle',
                                                                                    padding: '2px 3px',
                                                                                    fontSize: '7.5px',
                                                                                    width: '22%'
                                                                                }}
                                                                            >
                                                                                {facName}
                                                                            </td>
                                                                        )}
                                                                        <td style={{ border: '1px solid #000', padding: '1.5px 4px', textAlign: 'left', width: '34.5%' }}>{careerName}</td>
                                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '10%' }}>{stats.hombres || 0}</td>
                                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '10%' }}>{stats.mujeres || 0}</td>
                                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '10%' }}>{stats.lgbti || 0}</td>
                                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', width: '10%', fontWeight: 'bold' }}>{stats.total || 0}</td>
                                                                    </tr>
                                                                );
                                                            });
                                                        })}

                                                        {/* Filas de Resumen */}
                                                        <tr style={{ fontWeight: 'bold', fontSize: '7.5px' }}>
                                                            <td colSpan={3} style={{ border: '1px solid #000', backgroundColor: '#d9d9d9', padding: '2px 4px', textAlign: 'left' }}>ESTUDIANTES</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#fff' }}>{estH}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#fff' }}>{estM}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#fff' }}>{estL}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#fff' }}>{estT}</td>
                                                        </tr>
                                                        <tr style={{ fontWeight: 'bold', fontSize: '7.5px' }}>
                                                            <td colSpan={3} style={{ border: '1px solid #000', backgroundColor: '#d9d9d9', padding: '2px 4px', textAlign: 'left' }}>ADMINISTRATIVOS</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#fff' }}>{admH}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#fff' }}>{admM}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#fff' }}>{admL}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#fff' }}>{admT}</td>
                                                        </tr>
                                                        <tr style={{ fontWeight: 'bold', fontSize: '7.5px' }}>
                                                            <td colSpan={3} style={{ border: '1px solid #000', backgroundColor: '#d9d9d9', padding: '2px 4px', textAlign: 'left' }}>DOCENTES</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#fff' }}>{docH}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#fff' }}>{docM}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#fff' }}>{docL}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', backgroundColor: '#fff' }}>{docT}</td>
                                                        </tr>
                                                        <tr style={{ fontWeight: 'bold', fontSize: '7.5px', backgroundColor: '#d9d9d9' }}>
                                                            <td colSpan={3} style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'left' }}>TOTAL</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{totH}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{totM}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{totL}</td>
                                                            <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center' }}>{grandTotalAnexo}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            );
                                        })()}

                                        {/* Pie de Página Institucional */}
                                        <div style={{ position: 'absolute', bottom: '12mm', left: '18mm', right: '18mm' }}>
                                            <div style={{ borderTop: '1px solid #cbd5e1', marginBottom: '6px' }}></div>
                                            <div style={{ fontSize: '7.5px', lineHeight: 1.3, color: '#1e3a8a', textAlign: 'left', fontFamily: 'Arial, sans-serif' }}>
                                                <div>Dirección: &nbsp;Av. Ernesto Che Guevara y Gabriel Secaira</div>
                                                <div>Guaranda-Ecuador</div>
                                                <div>Teléfono: (593) 3220-6010 &nbsp;<strong>EXT 1168</strong></div>
                                                <div><strong>www.ueb.edu.ec</strong></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PÁGINA 7: ANEXOS (PREVENTIVA VS CURATIVA) */}
                                    <div className="preview-sheet" style={{ position: 'relative', minHeight: '297mm', padding: '10mm 16mm 22mm 16mm', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
                                        {/* Banner Institucional Superior */}
                                        <div style={{ marginBottom: '6px', textAlign: 'center' }}>
                                            <img src={headerBienestar} alt="UEB | Bienestar Universitario" style={{ width: '100%', maxHeight: '42px', objectFit: 'contain' }} />
                                        </div>

                                        {/* Título de la tabla centrado */}
                                        <div style={{ fontWeight: 'bold', fontSize: '9.5px', textAlign: 'center', marginBottom: '6px', color: '#000', textTransform: 'uppercase' }}>
                                            ATENCIONES DE ODONTOLOGÍA - {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][genReportMonth - 1]?.toUpperCase() || 'ABRIL'} {genReportYear}
                                        </div>

                                        {/* Tabla General Preventiva vs Curativa */}
                                        {(() => {
                                            const facConfigs = [
                                                {
                                                    shortName: 'F.C. SALUD',
                                                    fullName: 'CIENCIAS DE LA SALUD',
                                                    careers: ['Enfermería', 'Gestión de Riesgos', 'Psicología', 'Terapia Física']
                                                },
                                                {
                                                    shortName: 'F.C. JURISPRUDENCIA',
                                                    fullName: 'JURISPRUDENCIA',
                                                    careers: ['Criminalística', 'Derecho', 'Sociología']
                                                },
                                                {
                                                    shortName: 'F.C. ADMINISTRATIVAS',
                                                    fullName: 'CIENCIAS ADMINISTRATIVAS',
                                                    careers: [
                                                        'Ad. Empresas',
                                                        'Comunicación',
                                                        'Cont. Auditoría',
                                                        'Emprendimiento e Innovación',
                                                        'Gestión del Talento Humano',
                                                        'Marketing Digital',
                                                        'Mercadotecnia',
                                                        'Software',
                                                        'Tecnología de la Informática',
                                                        'Turismo'
                                                    ]
                                                },
                                                {
                                                    shortName: 'F.C. AGROPECUARIAS',
                                                    fullName: 'CIENCIAS AGROPECUARIAS',
                                                    careers: ['Agroindustria', 'Agronomía', 'Med. Veterinaria']
                                                },
                                                {
                                                    shortName: 'F.C. EDUCACIÓN',
                                                    fullName: 'CIENCIAS DE LA EDUCACIÓN',
                                                    careers: [
                                                        'Educación Básica',
                                                        'Educación Inicial',
                                                        'Educación Intercultural Bilingüe',
                                                        'Fisicomatemático',
                                                        'Pedagogía Idiomas Nacionales',
                                                        'Pedagogía de la Informática',
                                                        'Centro de Desarrollo Infantil'
                                                    ]
                                                }
                                            ];

                                            let estPrevH = 0, estPrevM = 0, estPrevL = 0, estPrevT = 0;
                                            let estCurH = 0, estCurM = 0, estCurL = 0, estCurT = 0;
                                            let estGrandTotal = 0;

                                            const facultyRowsJsx = facConfigs.map(cfg => {
                                                const facShort = cfg.shortName;
                                                const facFull = cfg.fullName;
                                                const careers = cfg.careers;
                                                const facRowspan = careers.length + 1;

                                                let fPrevH = 0, fPrevM = 0, fPrevL = 0, fPrevT = 0;
                                                let fCurH = 0, fCurM = 0, fCurL = 0, fCurT = 0;
                                                let fTotal = 0;

                                                const careerTrs = careers.map((careerName, idx) => {
                                                    const stats = genReportData.statsByFacultyAndCareer?.[facFull]?.[careerName] || {};
                                                    const p = stats.preventiva || {};
                                                    const c = stats.curativa || {};

                                                    const pH = p.hombres || 0;
                                                    const pM = p.mujeres || 0;
                                                    const pL = p.lgbti || 0;
                                                    const pT = p.total || (pH + pM + pL);

                                                    const cH = c.hombres || 0;
                                                    const cM = c.mujeres || 0;
                                                    const cL = c.lgbti || 0;
                                                    const cT = c.total || (cH + cM + cL);

                                                    const rowTotal = stats.total || (pT + cT);

                                                    fPrevH += pH; fPrevM += pM; fPrevL += pL; fPrevT += pT;
                                                    fCurH += cH; fCurM += cM; fCurL += cL; fCurT += cT;
                                                    fTotal += rowTotal;

                                                    estPrevH += pH; estPrevM += pM; estPrevL += pL; estPrevT += pT;
                                                    estCurH += cH; estCurM += cM; estCurL += cL; estCurT += cT;
                                                    estGrandTotal += rowTotal;

                                                    return (
                                                        <tr key={`anexo2-${facFull}-${careerName}`} style={{ fontSize: '7px' }}>
                                                            {idx === 0 && (
                                                                <td
                                                                    rowSpan={facRowspan}
                                                                    style={{
                                                                        border: '1px solid #000',
                                                                        backgroundColor: '#fde9d9',
                                                                        fontWeight: 'bold',
                                                                        textAlign: 'center',
                                                                        verticalAlign: 'middle',
                                                                        padding: '2px',
                                                                        width: '14%',
                                                                        color: '#000'
                                                                    }}
                                                                >
                                                                    {facShort}
                                                                </td>
                                                            )}
                                                            <td style={{ border: '1px solid #000', padding: '1px 3px', textAlign: 'left', width: '24%' }}>{careerName}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', width: '6%' }}>{pH}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', width: '6%' }}>{pM}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', width: '5%' }}>{pL}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', width: '7%', backgroundColor: '#d8e4bc', fontWeight: 'bold' }}>{pT}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', width: '6%' }}>{cH}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', width: '6%' }}>{cM}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', width: '5%' }}>{cL}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', width: '7%', backgroundColor: '#d8e4bc', fontWeight: 'bold' }}>{cT}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1px 2px', textAlign: 'center', width: '8%', backgroundColor: '#d8e4bc', fontWeight: 'bold' }}>{rowTotal}</td>
                                                        </tr>
                                                    );
                                                });

                                                const totalTr = (
                                                    <tr key={`anexo2-tot-${facFull}`} style={{ fontWeight: 'bold', fontSize: '7px', backgroundColor: '#fde9d9' }}>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 3px', textAlign: 'center' }}>TOTAL</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{fPrevH}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{fPrevM}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{fPrevL}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#d8e4bc' }}>{fPrevT}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{fCurH}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{fCurM}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{fCurL}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#d8e4bc' }}>{fCurT}</td>
                                                        <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#d8e4bc' }}>{fTotal}</td>
                                                    </tr>
                                                );

                                                return [careerTrs, totalTr];
                                            });

                                            // Administrativos
                                            const admPrev = genReportData.consolidadoStats?.preventivo?.['Examen Odontológico']?.administrativos || {};
                                            const admPrevH = admPrev.hombres || 0;
                                            const admPrevM = admPrev.mujeres || 0;
                                            const admPrevL = admPrev.lgbti || 0;
                                            const admPrevT = admPrev.total || (admPrevH + admPrevM + admPrevL);

                                            let admCurH = 0, admCurM = 0, admCurL = 0, admCurT = 0;
                                            (genReportData.curativosDiagnoses || []).forEach(diag => {
                                                const r = genReportData.consolidadoStats?.curativo?.[diag]?.administrativos || {};
                                                admCurH += r.hombres || 0;
                                                admCurM += r.mujeres || 0;
                                                admCurL += r.lgbti || 0;
                                                admCurT += r.total || 0;
                                            });
                                            const admTotal = genReportData.totalAdministrativos || (admPrevT + admCurT);

                                            // Docentes
                                            const docPrev = genReportData.consolidadoStats?.preventivo?.['Examen Odontológico']?.docentes || {};
                                            const docPrevH = docPrev.hombres || 0;
                                            const docPrevM = docPrev.mujeres || 0;
                                            const docPrevL = docPrev.lgbti || 0;
                                            const docPrevT = docPrev.total || (docPrevH + docPrevM + docPrevL);

                                            let docCurH = 0, docCurM = 0, docCurL = 0, docCurT = 0;
                                            (genReportData.curativosDiagnoses || []).forEach(diag => {
                                                const r = genReportData.consolidadoStats?.curativo?.[diag]?.docentes || {};
                                                docCurH += r.hombres || 0;
                                                docCurM += r.mujeres || 0;
                                                docCurL += r.lgbti || 0;
                                                docCurT += r.total || 0;
                                            });
                                            const docTotal = genReportData.totalDocentes || (docPrevT + docCurT);

                                            // Resumen General
                                            const grandPrevH = estPrevH + admPrevH + docPrevH;
                                            const grandPrevM = estPrevM + admPrevM + docPrevM;
                                            const grandPrevL = estPrevL + admPrevL + docPrevL;
                                            const grandPrevT = estPrevT + admPrevT + docPrevT;

                                            const grandCurH = estCurH + admCurH + docCurH;
                                            const grandCurM = estCurM + admCurM + docCurM;
                                            const grandCurL = estCurL + admCurL + docCurL;
                                            const grandCurT = estCurT + admCurT + docCurT;

                                            const grandTotalAll = genReportData.totalPacientes || (grandPrevT + grandCurT);

                                            return (
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif', border: '1.5px solid #000', fontSize: '7px', marginBottom: '4px' }}>
                                                    <thead>
                                                        <tr style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                            <th colSpan={2} style={{ border: '1px solid #000', backgroundColor: '#8db4e2', padding: '2px', color: '#000', width: '38%' }}>COMUNIDAD UNIVERSITARIA</th>
                                                            <th colSpan={4} style={{ border: '1px solid #000', backgroundColor: '#8db4e2', padding: '2px', color: '#000', width: '24%' }}>ODONTOLOGÍA PREVENTIVA</th>
                                                            <th colSpan={4} style={{ border: '1px solid #000', backgroundColor: '#8db4e2', padding: '2px', color: '#000', width: '24%' }}>ODONTOLOGÍA CURATIVA</th>
                                                            <th rowSpan={2} style={{ border: '1px solid #000', backgroundColor: '#d8e4bc', padding: '2px', color: '#000', width: '8%', verticalAlign: 'middle' }}>TOTAL</th>
                                                        </tr>
                                                        <tr style={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#fde9d9' }}>
                                                            <th style={{ border: '1px solid #000', padding: '1.5px 2px', color: '#000', width: '14%' }}>FACULTAD</th>
                                                            <th style={{ border: '1px solid #000', padding: '1.5px 2px', color: '#000', width: '24%' }}>CARRERA</th>
                                                            <th style={{ border: '1px solid #000', padding: '1.5px 2px', color: '#000', width: '6%' }}>MASCULINO</th>
                                                            <th style={{ border: '1px solid #000', padding: '1.5px 2px', color: '#000', width: '6%' }}>FEMENINO</th>
                                                            <th style={{ border: '1px solid #000', padding: '1.5px 2px', color: '#000', width: '5%' }}>LGBTI</th>
                                                            <th style={{ border: '1px solid #000', backgroundColor: '#d8e4bc', padding: '1.5px 2px', color: '#000', width: '7%' }}>TOTAL</th>
                                                            <th style={{ border: '1px solid #000', padding: '1.5px 2px', color: '#000', width: '6%' }}>MASCULINO</th>
                                                            <th style={{ border: '1px solid #000', padding: '1.5px 2px', color: '#000', width: '6%' }}>FEMENINO</th>
                                                            <th style={{ border: '1px solid #000', padding: '1.5px 2px', color: '#000', width: '5%' }}>LGBTI</th>
                                                            <th style={{ border: '1px solid #000', backgroundColor: '#d8e4bc', padding: '1.5px 2px', color: '#000', width: '7%' }}>TOTAL</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {facultyRowsJsx}

                                                        {/* Filas de Resumen */}
                                                        <tr style={{ fontWeight: 'bold', fontSize: '7px', backgroundColor: '#fde9d9' }}>
                                                            <td colSpan={2} style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'left' }}>ESTUDIANTES</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{estPrevH}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{estPrevM}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{estPrevL}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#d8e4bc' }}>{estPrevT}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{estCurH}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{estCurM}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{estCurL}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#d8e4bc' }}>{estCurT}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#d8e4bc' }}>{estGrandTotal}</td>
                                                        </tr>
                                                        <tr style={{ fontWeight: 'bold', fontSize: '7px', backgroundColor: '#fde9d9' }}>
                                                            <td colSpan={2} style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'left' }}>ADMINISTRATIVOS</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{admPrevH}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{admPrevM}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{admPrevL}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#d8e4bc' }}>{admPrevT}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{admCurH}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{admCurM}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{admCurL}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#d8e4bc' }}>{admCurT}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#d8e4bc' }}>{admTotal}</td>
                                                        </tr>
                                                        <tr style={{ fontWeight: 'bold', fontSize: '7px', backgroundColor: '#fde9d9' }}>
                                                            <td colSpan={2} style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'left' }}>DOCENTES</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{docPrevH}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{docPrevM}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{docPrevL}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#d8e4bc' }}>{docPrevT}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{docCurH}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{docCurM}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{docCurL}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#d8e4bc' }}>{docCurT}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#d8e4bc' }}>{docTotal}</td>
                                                        </tr>
                                                        <tr style={{ fontWeight: 'bold', fontSize: '7px', backgroundColor: '#cbd5e1' }}>
                                                            <td colSpan={2} style={{ border: '1px solid #000', padding: '2px 4px', textAlign: 'center' }}>TOTAL</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{grandPrevH}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{grandPrevM}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{grandPrevL}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#d8e4bc' }}>{grandPrevT}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{grandCurH}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{grandCurM}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center' }}>{grandCurL}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#d8e4bc' }}>{grandCurT}</td>
                                                            <td style={{ border: '1px solid #000', padding: '1.5px 2px', textAlign: 'center', backgroundColor: '#d8e4bc' }}>{grandTotalAll}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            );
                                        })()}

                                        {/* Pie de Página Institucional */}
                                        <div style={{ position: 'absolute', bottom: '10mm', left: '16mm', right: '16mm' }}>
                                            <div style={{ borderTop: '1px solid #cbd5e1', marginBottom: '4px' }}></div>
                                            <div style={{ fontSize: '7.5px', lineHeight: 1.3, color: '#1e3a8a', textAlign: 'left', fontFamily: 'Arial, sans-serif' }}>
                                                <div>Dirección: &nbsp;Av. Ernesto Che Guevara y Gabriel Secaira</div>
                                                <div>Guaranda-Ecuador</div>
                                                <div>Teléfono: (593) 3220-6010 &nbsp;<strong>EXT 1168</strong></div>
                                                <div><strong>www.ueb.edu.ec</strong></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PÁGINA 8: LEGALIZACIÓN Y FIRMAS */}
                                    <div className="preview-sheet" style={{ position: 'relative', minHeight: '297mm', padding: '14mm 18mm 25mm 18mm', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}>
                                        {/* Banner Institucional Superior */}
                                        <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                                            <img src={headerBienestar} alt="UEB | Bienestar Universitario" style={{ width: '100%', maxHeight: '48px', objectFit: 'contain' }} />
                                        </div>

                                        <div style={{ fontSize: '8px', fontFamily: 'Arial, sans-serif', marginTop: '18px', marginBottom: '12px', color: '#000', textAlign: 'left' }}>
                                            Adjunto {genReportData?.totalFojas || 18} fojas, copias a color partes diarios.
                                        </div>

                                        <table style={{ width: '80%', borderCollapse: 'collapse', marginTop: '10px', border: '1px solid #000', fontFamily: 'Arial, sans-serif', fontSize: '7.5px' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#e4dfec', fontWeight: 'bold' }}>
                                                    <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', width: '22%', fontWeight: 'bold', color: '#000' }}>Datos</td>
                                                    <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', width: '39%', fontWeight: 'bold', color: '#000' }}>Elaborado por:</td>
                                                    <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', width: '39%', fontWeight: 'bold', color: '#000' }}>Revisado y Aprobado por:</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e4dfec', height: '50px', verticalAlign: 'top', color: '#000' }}>Firmas</td>
                                                    <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', height: '50px', backgroundColor: '#fff' }}></td>
                                                    <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', height: '50px', backgroundColor: '#fff' }}></td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e4dfec', color: '#000' }}>Nombre y Apellido</td>
                                                    <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'center', color: '#000', backgroundColor: '#fff' }}>{doctorNameText}</td>
                                                    <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'center', color: '#000', backgroundColor: '#fff' }}>Michel Gaibor Vásquez</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e4dfec', color: '#000' }}>Cargo</td>
                                                    <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'center', color: '#000', backgroundColor: '#fff' }}>Odontóloga de Bienestar Universitario</td>
                                                    <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'center', color: '#000', backgroundColor: '#fff' }}>Coordinadora de Bienestar Universitario</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Pie de Página Institucional */}
                                        <div style={{ position: 'absolute', bottom: '12mm', left: '18mm', right: '18mm' }}>
                                            <div style={{ borderTop: '1px solid #cbd5e1', marginBottom: '6px' }}></div>
                                            <div style={{ fontSize: '7.5px', lineHeight: 1.3, color: '#1e3a8a', textAlign: 'left', fontFamily: 'Arial, sans-serif' }}>
                                                <div>Dirección: &nbsp;Av. Ernesto Che Guevara y Gabriel Secaira</div>
                                                <div>Guaranda-Ecuador</div>
                                                <div>Teléfono: (593) 3220-6010 &nbsp;<strong>EXT 1168</strong></div>
                                                <div><strong>www.ueb.edu.ec</strong></div>
                                            </div>
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

            {/* MODAL REGISTRAR SESIÓN DE EVOLUCIÓN ODONTOLÓGICA */}
            {isEvolucionModalOpen && selectedPatient && (
                <div className="clinical-modal show" style={{ zIndex: 9999 }}>
                    <div className="clinical-modal__backdrop" onClick={() => setIsEvolucionModalOpen(false)}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '540px' }}>
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <span className="clinical-modal__avatar" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                                    <Stethoscope size={18} />
                                </span>
                                <div>
                                    <span>Registrar Evolución Odontológica</span>
                                    <h2>{selectedPatient.nombre_completo || selectedPatient.name}</h2>
                                </div>
                            </div>
                            <button type="button" className="clinical-modal__close" onClick={() => setIsEvolucionModalOpen(false)}>
                                <X size={15} />
                            </button>
                        </header>
                        <form onSubmit={handleSaveEvolucion} className="clinical-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="premium-field-card" style={{ margin: 0 }}>
                                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                                        Fecha de Atención
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={evolucionForm.fecha}
                                        onChange={(e) => setEvolucionForm(prev => ({ ...prev, fecha: e.target.value }))}
                                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                                    />
                                </div>
                                <div className="premium-field-card" style={{ margin: 0 }}>
                                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                                        Procedimiento Dental
                                    </label>
                                    <input
                                        type="text"
                                        value={evolucionForm.detalle_procedimiento}
                                        onChange={(e) => setEvolucionForm(prev => ({ ...prev, detalle_procedimiento: e.target.value }))}
                                        placeholder="Ej. Profilaxis, Curación, Control..."
                                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                                    />
                                </div>
                            </div>

                            <div className="premium-field-card" style={{ margin: 0 }}>
                                <div className="field-header" style={{ marginBottom: '6px' }}>
                                    <div className="field-header__left">
                                        <span className="field-header__icon"><FileText size={14} /></span>
                                        <h4 className="field-header__title" style={{ fontSize: '12.5px' }}>Detalle del Tratamiento / Evolución</h4>
                                    </div>
                                    <span className="field-badge-req">Requerido</span>
                                </div>
                                <textarea
                                    required
                                    value={evolucionForm.detalle_tratamiento}
                                    onChange={(e) => setEvolucionForm(prev => ({ ...prev, detalle_tratamiento: e.target.value }))}
                                    placeholder="Describa el avance clínico, piezas tratadas, anestesia utilizada, respuesta del paciente..."
                                    rows={4}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12.5px', minHeight: '90px' }}
                                />
                            </div>

                            <div className="premium-field-card" style={{ margin: 0 }}>
                                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                                    Prescripción / Indicaciones Farmacéuticas
                                </label>
                                <input
                                    type="text"
                                    value={evolucionForm.prescripción_farmaceutica}
                                    onChange={(e) => setEvolucionForm(prev => ({ ...prev, prescripción_farmaceutica: e.target.value }))}
                                    placeholder="Ej. Ibuprofeno 400mg cada 8 horas por 3 días / Ninguna"
                                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                                <button type="button" className="action-button action-button--light" onClick={() => setIsEvolucionModalOpen(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="action-button action-button--primary" disabled={evolucionLoading}>
                                    {evolucionLoading ? "Guardando..." : "Guardar Evolución"}
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
