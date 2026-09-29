import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import api from '../../api/axios';
import '../../medical.css';
import HelpPanel from '../../components/HelpPanel';
import UserProfileMenu from '../../components/UserProfileMenu';
import PasswordRequirements from '../../components/PasswordRequirements';

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
    ChevronRight,
    ChevronLeft,
    Activity,
    ClipboardList,
    CheckCircle,
    AlertTriangle,
    Stethoscope,
    User,
    UserPlus,
    Shield,
    CalendarCheck,
    CalendarDays,
    Info,
    TrendingUp,
    Users,
    Key,
    Power,
    ShieldAlert,
    Download,
    SlidersHorizontal,
    RefreshCw,
    Award,
    Building2,
    GraduationCap,
    School,
    Landmark,
    Trash2,
    Edit3,
    Layers
} from 'lucide-react';

const Administrador_page = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    // Estado de pestañas activas: 'users' | 'dashboard' | 'register' | 'reports' | 'logs'
    const [activeTab, setActiveTab] = useState('users');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });

    const showSystemToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3400);
    };

    // Modal de confirmación custom
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null
    });

    // ==========================================
    // ESTADOS TALLER 1: GESTIÓN DE CAMPUS, FACULTADES Y CARRERAS (CRUD)
    // ==========================================
    const [campusSubTab, setCampusSubTab] = useState('campus'); // 'campus' | 'facultades' | 'carreras'
    const [campusList, setCampusList] = useState([]);
    const [facultadesList, setFacultadesList] = useState([]);
    const [carrerasList, setCarrerasList] = useState([]);
    const [campusLoading, setCampusLoading] = useState(false);

    const [campusSearch, setCampusSearch] = useState('');
    const [facultadSearch, setFacultadSearch] = useState('');
    const [carreraSearch, setCarreraSearch] = useState('');
    const [carreraFacultadFilter, setCarreraFacultadFilter] = useState('all');

    // Modales y formularios
    const [isCampusModalOpen, setIsCampusModalOpen] = useState(false);
    const [campusForm, setCampusForm] = useState({ id: null, nombre: '' });
    const [campusFormLoading, setCampusFormLoading] = useState(false);

    const [isFacultadModalOpen, setIsFacultadModalOpen] = useState(false);
    const [facultadForm, setFacultadForm] = useState({ id: null, nombre: '' });
    const [facultadFormLoading, setFacultadFormLoading] = useState(false);

    const [isCarreraModalOpen, setIsCarreraModalOpen] = useState(false);
    const [carreraForm, setCarreraForm] = useState({ id: null, id_facultad: '', nombre: '' });
    const [carreraFormLoading, setCarreraFormLoading] = useState(false);

    const fetchCampusData = async () => {
        setCampusLoading(true);
        try {
            const [campusRes, facultadesRes, carrerasRes] = await Promise.all([
                api.get('/campus-management/campus').catch(() => ({ data: { data: [] } })),
                api.get('/campus-management/facultades').catch(() => ({ data: { data: [] } })),
                api.get('/campus-management/carreras').catch(() => ({ data: { data: [] } }))
            ]);
            setCampusList(campusRes.data.data || []);
            setFacultadesList(facultadesRes.data.data || []);
            setCarrerasList(carrerasRes.data.data || []);
        } catch (err) {
            console.error(err);
            showSystemToast("Error al cargar estructura de campus.");
        } finally {
            setCampusLoading(false);
        }
    };

    // --- CRUD HANDLERS CAMPUS ---
    const handleOpenCampusModal = (item = null) => {
        setCampusForm({
            id: item ? item.id : null,
            nombre: item ? item.nombre : ''
        });
        setIsCampusModalOpen(true);
    };

    const handleSaveCampus = async (e) => {
        e.preventDefault();
        if (!campusForm.nombre.trim()) return;
        setCampusFormLoading(true);
        try {
            if (campusForm.id) {
                await api.put(`/campus-management/campus/${campusForm.id}`, { nombre: campusForm.nombre });
                showSystemToast("Campus actualizado con éxito.");
            } else {
                await api.post('/campus-management/campus', { nombre: campusForm.nombre });
                showSystemToast("Campus registrado con éxito.");
            }
            setIsCampusModalOpen(false);
            fetchCampusData();
        } catch (err) {
            console.error(err);
            showSystemToast(err.response?.data?.message || "Error al guardar el campus.");
        } finally {
            setCampusFormLoading(false);
        }
    };

    const handleDeleteCampus = (item) => {
        setConfirmModal({
            show: true,
            title: 'ELIMINAR CAMPUS',
            message: `¿Está seguro de que desea eliminar el campus "${item.nombre}"?`,
            onConfirm: async () => {
                try {
                    await api.delete(`/campus-management/campus/${item.id}`);
                    showSystemToast("Campus eliminado correctamente.");
                    fetchCampusData();
                } catch (err) {
                    console.error(err);
                    showSystemToast(err.response?.data?.message || "Error al eliminar el campus.");
                }
            }
        });
    };

    // --- CRUD HANDLERS FACULTAD ---
    const handleOpenFacultadModal = (item = null) => {
        setFacultadForm({
            id: item ? item.id : null,
            nombre: item ? item.nombre : ''
        });
        setIsFacultadModalOpen(true);
    };

    const handleSaveFacultad = async (e) => {
        e.preventDefault();
        if (!facultadForm.nombre.trim()) return;
        setFacultadFormLoading(true);
        try {
            if (facultadForm.id) {
                await api.put(`/campus-management/facultades/${facultadForm.id}`, { nombre: facultadForm.nombre });
                showSystemToast("Facultad actualizada con éxito.");
            } else {
                await api.post('/campus-management/facultades', { nombre: facultadForm.nombre });
                showSystemToast("Facultad registrada con éxito.");
            }
            setIsFacultadModalOpen(false);
            fetchCampusData();
        } catch (err) {
            console.error(err);
            showSystemToast(err.response?.data?.message || "Error al guardar la facultad.");
        } finally {
            setFacultadFormLoading(false);
        }
    };

    const handleDeleteFacultad = (item) => {
        setConfirmModal({
            show: true,
            title: 'ELIMINAR FACULTAD',
            message: `¿Está seguro de que desea eliminar la facultad "${item.nombre}"?`,
            onConfirm: async () => {
                try {
                    await api.delete(`/campus-management/facultades/${item.id}`);
                    showSystemToast("Facultad eliminada correctamente.");
                    fetchCampusData();
                } catch (err) {
                    console.error(err);
                    showSystemToast(err.response?.data?.message || "Error al eliminar la facultad.");
                }
            }
        });
    };

    // --- CRUD HANDLERS CARRERA ---
    const handleOpenCarreraModal = (item = null) => {
        setCarreraForm({
            id: item ? item.id : null,
            id_facultad: item ? item.id_facultad : (facultadesList[0]?.id || ''),
            nombre: item ? item.nombre : ''
        });
        setIsCarreraModalOpen(true);
    };

    const handleSaveCarrera = async (e) => {
        e.preventDefault();
        if (!carreraForm.nombre.trim() || !carreraForm.id_facultad) return;
        setCarreraFormLoading(true);
        try {
            const payload = {
                nombre: carreraForm.nombre,
                id_facultad: Number(carreraForm.id_facultad)
            };
            if (carreraForm.id) {
                await api.put(`/campus-management/carreras/${carreraForm.id}`, payload);
                showSystemToast("Carrera actualizada con éxito.");
            } else {
                await api.post('/campus-management/carreras', payload);
                showSystemToast("Carrera registrada con éxito.");
            }
            setIsCarreraModalOpen(false);
            fetchCampusData();
        } catch (err) {
            console.error(err);
            showSystemToast(err.response?.data?.message || "Error al guardar la carrera.");
        } finally {
            setCarreraFormLoading(false);
        }
    };

    const handleDeleteCarrera = (item) => {
        setConfirmModal({
            show: true,
            title: 'ELIMINAR CARRERA',
            message: `¿Está seguro de que desea eliminar la carrera "${item.nombre}"?`,
            onConfirm: async () => {
                try {
                    await api.delete(`/campus-management/carreras/${item.id}`);
                    showSystemToast("Carrera eliminada correctamente.");
                    fetchCampusData();
                } catch (err) {
                    console.error(err);
                    showSystemToast(err.response?.data?.message || "Error al eliminar la carrera.");
                }
            }
        });
    };

    // ==========================================
    // ESTADOS TALLER 2: GESTIÓN DE USUARIOS & ROLES (CRUD)
    // ==========================================
    const [usersList, setUsersList] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersSearch, setUsersSearch] = useState('');
    const [usersRoleFilter, setUsersRoleFilter] = useState('all');
    const [usersStatusFilter, setUsersStatusFilter] = useState('all');

    // Options mapping Tipo de Afiliación / Rol de Usuario
    const AFFILIATION_OPTIONS = [
        { key: 'estudiante', label: 'Estudiante Universitario', id_tipo_usuario: 2, role: 'paciente' },
        { key: 'docente', label: 'Docente / Profesor', id_tipo_usuario: 3, role: 'paciente' },
        { key: 'administrativo', label: 'Personal Administrativo', id_tipo_usuario: 4, role: 'paciente' },
        { key: 'codigo_trabajo', label: 'Servidor Público / Código de Trabajo', id_tipo_usuario: 5, role: 'paciente' },
        { key: 'medico_general', label: 'Médico General', id_tipo_usuario: 1, role: 'medico_general' },
        { key: 'enfermero', label: 'Enfermero / Enfermera', id_tipo_usuario: 1, role: 'enfermero' },
        { key: 'psicologo', label: 'Psicólogo / Psicóloga', id_tipo_usuario: 1, role: 'psicologo' },
        { key: 'odontologo', label: 'Odontólogo / Odontóloga', id_tipo_usuario: 1, role: 'odontologo' },
        { key: 'medico_ocupacional', label: 'Médico Ocupacional', id_tipo_usuario: 1, role: 'medico_ocupacional' },
        { key: 'medico_coordinador', label: 'Médico Coordinador', id_tipo_usuario: 1, role: 'medico_coordinador' },
        { key: 'administrador', label: 'Administrador del Sistema', id_tipo_usuario: 1, role: 'administrador' },
    ];

    // Modales de Usuario
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    
    // Formulario de edición de usuario (con Afiliación / Rol y Cambio de Contraseña)
    const [editUserForm, setEditUserForm] = useState({
        name: '',
        email: '',
        affiliationKey: 'estudiante',
        password: ''
    });
    const [editUserLoading, setEditUserLoading] = useState(false);

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const response = await api.get('/users');
            setUsersList(response.data.data || []);
        } catch (err) {
            console.error(err);
            showSystemToast("Error al cargar listado de usuarios.");
        } finally {
            setUsersLoading(false);
        }
    };

    const handleToggleUserStatus = (u) => {
        const action = u.activo ? 'deshabilitar' : 'habilitar';
        setConfirmModal({
            show: true,
            title: `${action.toUpperCase()} USUARIO`,
            message: `¿Está seguro de que desea ${action} la cuenta de ${u.nombre_completo || u.name || u.email}?`,
            onConfirm: async () => {
                try {
                    const endpoint = u.activo ? `/users/${u.id}/disable` : `/users/${u.id}/enable`;
                    await api.put(endpoint);
                    showSystemToast(`Usuario ${u.activo ? 'deshabilitado' : 'habilitado'} correctamente.`);
                    fetchUsers();
                } catch (err) {
                    console.error(err);
                    showSystemToast("Error al actualizar estado del usuario.");
                }
            }
        });
    };

    const handleOpenEditUserModal = (u) => {
        setSelectedUser(u);

        const roles = (u.roles || []).map(r => (typeof r === 'string' ? r : r?.name || '').toLowerCase());
        let detectedKey = 'estudiante';
        if (roles.includes('enfermero')) detectedKey = 'enfermero';
        else if (roles.includes('medico_general')) detectedKey = 'medico_general';
        else if (roles.includes('psicologo')) detectedKey = 'psicologo';
        else if (roles.includes('odontologo')) detectedKey = 'odontologo';
        else if (roles.includes('medico_ocupacional')) detectedKey = 'medico_ocupacional';
        else if (roles.includes('medico_coordinador')) detectedKey = 'medico_coordinador';
        else if (roles.includes('administrador')) detectedKey = 'administrador';
        else if (u.id_tipo_usuario === 3 || roles.includes('docente')) detectedKey = 'docente';
        else if (u.id_tipo_usuario === 4 || roles.includes('administrativo')) detectedKey = 'administrativo';
        else if (u.id_tipo_usuario === 5 || roles.includes('codigo_trabajo')) detectedKey = 'codigo_trabajo';
        else if (u.id_tipo_usuario === 2 || roles.includes('estudiante')) detectedKey = 'estudiante';
        else if (roles.includes('paciente')) {
            if (u.id_tipo_usuario === 3) detectedKey = 'docente';
            else if (u.id_tipo_usuario === 4) detectedKey = 'administrativo';
            else if (u.id_tipo_usuario === 5) detectedKey = 'codigo_trabajo';
            else detectedKey = 'estudiante';
        }
        else if (u.id_tipo_usuario === 1) detectedKey = 'medico_general';

        setEditUserForm({
            name: u.nombre_completo || u.name || '',
            email: u.email || '',
            affiliationKey: detectedKey,
            password: ''
        });
        setIsEditUserModalOpen(true);
    };

    const handleSaveEditUser = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        setEditUserLoading(true);

        const selectedOpt = AFFILIATION_OPTIONS.find(o => o.key === editUserForm.affiliationKey) || AFFILIATION_OPTIONS[0];

        const payload = {
            name: editUserForm.name,
            email: editUserForm.email,
            id_tipo_usuario: selectedOpt.id_tipo_usuario,
            roles: [selectedOpt.role]
        };

        if (editUserForm.password && editUserForm.password.trim()) {
            payload.password = editUserForm.password;
        }

        try {
            await api.put(`/users/${selectedUser.id}`, payload);
            showSystemToast("Datos del usuario actualizados con éxito.");
            setIsEditUserModalOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (err) {
            console.error(err);
            const errDetail = err.response?.data?.errors 
                ? Object.values(err.response.data.errors).flat().join(' ')
                : (err.response?.data?.message || "Error al actualizar los datos del usuario.");
            showSystemToast(errDetail);
        } finally {
            setEditUserLoading(false);
        }
    };

    // ==========================================
    // ESTADOS TALLER 3: REGISTRO DE NUEVO USUARIO (MODAL)
    // ==========================================
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [registerForm, setRegisterForm] = useState({
        nombres: '',
        apellidos: '',
        cedula: '',
        affiliationKey: 'estudiante',
        correo: ''
    });
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setRegisterLoading(true);
        setRegisterError('');

        try {
            const defaultPassword = `Ueb${registerForm.cedula}*`;
            const selectedAff = AFFILIATION_OPTIONS.find(opt => opt.key === registerForm.affiliationKey) || AFFILIATION_OPTIONS[0];

            const regResponse = await api.post('/users', {
                email: registerForm.correo,
                name: `${registerForm.nombres.trim()} ${registerForm.apellidos.trim()}`,
                password: defaultPassword,
                password_confirmation: defaultPassword,
                id_tipo_usuario: selectedAff.id_tipo_usuario,
                roles: [selectedAff.role]
            });

            const userToken = regResponse.data.token || '';
            const nameParts = registerForm.nombres.trim().split(/\s+/);
            const lastNameParts = registerForm.apellidos.trim().split(/\s+/);

            const profilePayload = {
                primer_nombre: nameParts[0],
                segundo_nombre: nameParts.slice(1).join(' ') || null,
                apellido_paterno: lastNameParts[0],
                apellido_materno: lastNameParts.slice(1).join(' ') || null,
                numero_cedula: registerForm.cedula
            };

            await api.post('/user-profile/identification', profilePayload, {
                headers: userToken ? { Authorization: `Bearer ${userToken}` } : {}
            }).catch(() => console.log("Perfil omitido temporalmente."));

            showSystemToast("¡Usuario registrado con éxito!");
            setIsCreateUserModalOpen(false);
            setRegisterForm({
                nombres: '',
                apellidos: '',
                cedula: '',
                affiliationKey: 'estudiante',
                correo: ''
            });
            fetchUsers();
        } catch (err) {
            console.error(err);
            setRegisterError(err.response?.data?.message || 'Error al registrar credenciales. Verifique el correo o cédula.');
        } finally {
            setRegisterLoading(false);
        }
    };

    // ==========================================
    // ESTADOS TALLER 4: REPORTES AVANZADOS
    // ==========================================
    const [catalogs, setCatalogs] = useState({ facultades: [], carreras: [], generos: [], tipos_usuario: [] });
    const [reportForm, setReportForm] = useState({
        fecha_desde: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        fecha_hasta: new Date().toISOString().slice(0, 10),
        tipo: 'medicina_general', // medicina_general, enfermeria, psicologia
        id_facultad: '',
        id_carrera: '',
        id_genero: '',
        id_tipo_usuario: '',
        agrupar_por: 'facultad' // facultad, carrera, genero, tipo_usuario, mensual
    });
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    const fetchReportCatalogs = async () => {
        try {
            const response = await api.get('/reportes/catalogos');
            setCatalogs(response.data.data || { facultades: [], carreras: [], generos: [], tipos_usuario: [] });
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerateReport = async (e) => {
        e.preventDefault();
        setReportLoading(true);
        try {
            const params = {};
            Object.keys(reportForm).forEach(key => {
                if (reportForm[key]) params[key] = reportForm[key];
            });
            const response = await api.get('/reportes', { params });
            setReportData(response.data.data);
        } catch (err) {
            console.error(err);
            showSystemToast("Error al generar el reporte estadístico.");
        } finally {
            setReportLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const params = {};
            Object.keys(reportForm).forEach(key => {
                if (reportForm[key]) params[key] = reportForm[key];
            });

            showSystemToast("Generando reporte oficial en PDF...");
            const response = await api.get('/reportes/pdf', {
                params,
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_${reportForm.tipo}_${reportForm.fecha_desde}_a_${reportForm.fecha_hasta}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showSystemToast("Reporte PDF descargado.");
        } catch (err) {
            console.error(err);
            showSystemToast("Error al exportar el PDF.");
        }
    };

    // ==========================================
    // ESTADOS TALLER 5: AUDITORÍA Y SEGURIDAD (LOGS)
    // ==========================================
    const [auditLogsList, setAuditLogsList] = useState([]);
    const [securityLogsList, setSecurityLogsList] = useState([]);
    const [loginAttemptsList, setLoginAttemptsList] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsSearchText, setLogsSearchText] = useState('');
    const [logsSubTab, setLogsSubTab] = useState('audit'); // 'audit' | 'login' | 'security'

    const fetchLogs = async () => {
        setLogsLoading(true);
        try {
            const [auditRes, securityRes, attemptsRes] = await Promise.all([
                api.get('/audit-logs').catch(() => ({ data: { data: [] } })),
                api.get('/security-logs').catch(() => ({ data: { data: [] } })),
                api.get('/login-attempts').catch(() => ({ data: { data: [] } }))
            ]);
            setAuditLogsList(auditRes.data.data || []);
            setSecurityLogsList(securityRes.data.data || []);
            setLoginAttemptsList(attemptsRes.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLogsLoading(false);
        }
    };

    // ==========================================
    // INITIAL LOAD WATCHER
    // ==========================================
    useEffect(() => {
        fetchCampusData();
        fetchUsers();
        fetchReportCatalogs();
        fetchLogs();
    }, []);

    useEffect(() => {
        if (activeTab === 'campus') {
            fetchCampusData();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'logs') {
            fetchLogs();
        }
    }, [activeTab]);

    // Estados para filtros de fecha y paginación (12 filas por página)
    const [auditDateFilter, setAuditDateFilter] = useState('');
    const [auditPage, setAuditPage] = useState(1);

    const [loginDateFilter, setLoginDateFilter] = useState('');
    const [loginPage, setLoginPage] = useState(1);

    const [securityDateFilter, setSecurityDateFilter] = useState('');
    const [securityPage, setSecurityPage] = useState(1);

    const LOGS_PER_PAGE = 12;

    // Helpers para la pestaña de logs y auditoría
    const matchesLogDate = (createdAt, filterDate) => {
        if (!filterDate) return true;
        if (!createdAt) return false;
        if (createdAt.startsWith(filterDate)) return true;
        try {
            const d = new Date(createdAt);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}` === filterDate;
        } catch {
            return false;
        }
    };

    const getFilteredAuditLogs = () => {
        return auditLogsList.filter(l => {
            const matchesText = !logsSearchText ||
                (l.user?.name || '').toLowerCase().includes(logsSearchText.toLowerCase()) ||
                (l.user?.email || '').toLowerCase().includes(logsSearchText.toLowerCase()) ||
                (l.action || '').toLowerCase().includes(logsSearchText.toLowerCase()) ||
                (l.model_type || '').toLowerCase().includes(logsSearchText.toLowerCase()) ||
                (l.ip_address || '').includes(logsSearchText);

            const matchesD = matchesLogDate(l.created_at, auditDateFilter);
            return matchesText && matchesD;
        });
    };

    const getFilteredLoginAttempts = () => {
        return loginAttemptsList.filter(a => {
            const isSuccess = Boolean(a.success ?? a.successful);
            const statusStr = isSuccess ? 'exitoso exitosa success' : 'fallido fallida error failed';
            const matchesText = !logsSearchText ||
                (a.email || '').toLowerCase().includes(logsSearchText.toLowerCase()) ||
                (a.ip_address || '').includes(logsSearchText) ||
                (a.user_agent || '').toLowerCase().includes(logsSearchText.toLowerCase()) ||
                statusStr.includes(logsSearchText.toLowerCase());

            const matchesD = matchesLogDate(a.created_at, loginDateFilter);
            return matchesText && matchesD;
        });
    };

    const getFilteredSecurityLogs = () => {
        return securityLogsList.filter(s => {
            const matchesText = !logsSearchText ||
                (s.event_type || '').toLowerCase().includes(logsSearchText.toLowerCase()) ||
                (s.description || '').toLowerCase().includes(logsSearchText.toLowerCase()) ||
                (s.ip_address || '').includes(logsSearchText) ||
                (s.user?.email || '').toLowerCase().includes(logsSearchText.toLowerCase());

            const matchesD = matchesLogDate(s.created_at, securityDateFilter);
            return matchesText && matchesD;
        });
    };

    const formatLogDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleString('es-EC', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch {
            return dateStr.slice(0, 19).replace('T', ' ');
        }
    };

    const formatLogAction = (action) => {
        if (!action) return { label: 'Acción', bg: '#f1f5f9', color: '#475569' };
        const act = action.toLowerCase();
        if (act.includes('created') || act.includes('store') || act.includes('enabled') || act.includes('success')) {
            return { label: action.replace(/_/g, ' '), bg: '#dcfce7', color: '#15803d' };
        }
        if (act.includes('delete') || act.includes('destroy') || act.includes('disabled') || act.includes('failed') || act.includes('blocked')) {
            return { label: action.replace(/_/g, ' '), bg: '#fee2e2', color: '#b91c1c' };
        }
        if (act.includes('update') || act.includes('edit')) {
            return { label: action.replace(/_/g, ' '), bg: '#e0f2fe', color: '#0369a1' };
        }
        return { label: action.replace(/_/g, ' '), bg: '#f1f5f9', color: '#475569' };
    };

    const renderPaginationBar = (currentPage, totalItems, onPageChange) => {
        const totalPages = Math.max(1, Math.ceil(totalItems / LOGS_PER_PAGE));
        if (totalItems === 0) return null;

        const startIdx = (currentPage - 1) * LOGS_PER_PAGE + 1;
        const endIdx = Math.min(currentPage * LOGS_PER_PAGE, totalItems);

        return (
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid #f1f5f9',
                flexWrap: 'wrap',
                gap: '10px',
                fontSize: '12px'
            }}>
                <div style={{ color: 'var(--text-muted)' }}>
                    Mostrando <strong style={{ color: 'var(--text-primary)' }}>{startIdx}</strong> a <strong style={{ color: 'var(--text-primary)' }}>{endIdx}</strong> de <strong style={{ color: 'var(--text-primary)' }}>{totalItems}</strong> registros
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: currentPage <= 1 ? '#f8fafc' : '#fff',
                            color: currentPage <= 1 ? '#cbd5e1' : 'var(--text-primary)',
                            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11.5px',
                            fontWeight: 500,
                            transition: 'all 0.15s ease'
                        }}
                    >
                        <ChevronLeft size={13} /> Anterior
                    </button>

                    <span style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: '#eff6ff',
                        color: 'var(--primary)',
                        fontWeight: 650,
                        fontSize: '11.5px',
                        border: '1px solid #bfdbfe'
                    }}>
                        Página {currentPage} de {totalPages}
                    </span>

                    <button
                        type="button"
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: currentPage >= totalPages ? '#f8fafc' : '#fff',
                            color: currentPage >= totalPages ? '#cbd5e1' : 'var(--text-primary)',
                            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11.5px',
                            fontWeight: 500,
                            transition: 'all 0.15s ease'
                        }}
                    >
                        Siguiente <ChevronRight size={13} />
                    </button>
                </div>
            </div>
        );
    };
    // Filtrado de lista de usuarios localmente
    const getFilteredUsers = () => {
        return usersList.filter(u => {
            const text = usersSearch.toLowerCase();
            const matchesText = !text ||
                (u.nombre_completo || u.name || '').toLowerCase().includes(text) ||
                (u.email || '').toLowerCase().includes(text) ||
                (u.numero_cedula || u.cedula || '').includes(text);

            const matchesRole = usersRoleFilter === 'all' || u.roles?.includes(usersRoleFilter);
            const matchesStatus = usersStatusFilter === 'all' ||
                (usersStatusFilter === 'active' && u.activo) ||
                (usersStatusFilter === 'inactive' && !u.activo);

            return matchesText && matchesRole && matchesStatus;
        });
    };

    // Gráfico de Barras SVG Dinámico para atenciones mensuales/diarias
    const renderSVGChart = () => {
        if (!dashboardData?.atenciones_por_tiempo || dashboardData.atenciones_por_tiempo.length === 0) {
            return (
                <div style={{ height: '220px', display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>
                    No hay atenciones registradas en este periodo.
                </div>
            );
        }

        const data = dashboardData.atenciones_por_tiempo;
        const maxVal = Math.max(...data.map(d => d.total || d.cantidad || 0), 5);
        const chartHeight = 180;
        const barWidth = 40;
        const gap = 16;
        const svgWidth = data.length * (barWidth + gap) + 40;

        return (
            <div style={{ overflowX: 'auto', padding: '10px 0' }}>
                <svg width={Math.max(svgWidth, 600)} height={chartHeight + 40} style={{ margin: '0 auto', display: 'block' }}>
                    {data.map((item, idx) => {
                        const val = item.total || item.cantidad || 0;
                        const barHeight = (val / maxVal) * chartHeight;
                        const x = idx * (barWidth + gap) + 30;
                        const y = chartHeight - barHeight + 20;

                        return (
                            <g key={idx}>
                                {/* Gradient definition */}
                                <defs>
                                    <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="var(--accent)" />
                                        <stop offset="100%" stopColor="var(--primary)" />
                                    </linearGradient>
                                </defs>
                                {/* Bar */}
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    rx={6}
                                    fill="url(#barGrad)"
                                    opacity={0.88}
                                    style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                                />
                                {/* Value overlay */}
                                <text
                                    x={x + barWidth / 2}
                                    y={y - 6}
                                    textAnchor="middle"
                                    fill="var(--primary)"
                                    fontSize="10px"
                                    fontWeight="bold"
                                >
                                    {val}
                                </text>
                                {/* Date labels */}
                                <text
                                    x={x + barWidth / 2}
                                    y={chartHeight + 34}
                                    textAnchor="middle"
                                    fill="var(--text-muted)"
                                    fontSize="8.5px"
                                >
                                    {item.periodo || item.fecha || item.dia || item.mes || `T${idx + 1}`}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        );
    };

    return (
        <div className="nurse-shell">
            <div className="app">
                <div className={`overlay ${isSidebarOpen ? 'show' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

                {/* SIDEBAR ADMINISTRACIÓN */}
                <aside className={`sidebar ${isSidebarOpen ? 'show' : ''}`}>
                    <div className="brand">
                        <div className="brand__logo" style={{ background: 'var(--accent)' }}>
                            <Shield size={20} color="white" />
                        </div>
                        <div className="brand__text">
                            <strong>Bienestar</strong>
                            <span>Administración</span>
                        </div>
                        <button className="sidebar__close" onClick={() => setIsSidebarOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <p className="sidebar__label">CONTROLES DE GESTIÓN</p>
                    <nav className="navigation">
                        <button
                            className={`navigation__item ${activeTab === 'campus' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('campus'); setIsSidebarOpen(false); }}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><Building2 size={18} /></span>
                            <span className="navigation__text">Gestión Campus</span>
                        </button>
                        <button
                            className={`navigation__item ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><Users size={18} /></span>
                            <span className="navigation__text">Gestión de Usuarios</span>
                        </button>
                        <button
                            className={`navigation__item ${activeTab === 'logs' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('logs'); setIsSidebarOpen(false); }}
                        >
                            <span className="navigation__indicator"></span>
                            <span className="navigation__icon"><ShieldAlert size={18} /></span>
                            <span className="navigation__text">Logs de Auditoría</span>
                        </button>
                    </nav>

                    <div className="sidebar__footer">
                        <button className="logout-button" onClick={() => {
                            setConfirmModal({
                                show: true,
                                title: 'Cerrar Sesión',
                                message: '¿Está seguro de que desea cerrar la sesión de administración?',
                                onConfirm: () => {
                                    logout();
                                    navigate('/login');
                                }
                            });
                        }}>
                            <span className="logout-button__icon"><LogOut size={16} /></span>
                            <span>Cerrar sesión</span>
                        </button>
                        <p className="system-version">Sistema BU · Admin</p>
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
                                <p className="breadcrumb">Administración / <span>{activeTab.toUpperCase()}</span></p>
                                <h1>
                                    {activeTab === 'campus' ? 'Gestión de Campus, Facultades y Carreras' :
                                        activeTab === 'users' ? 'Cuentas de Usuarios Registradas' : 'Bitácora de Eventos y Auditoría'}
                                </h1>
                            </div>
                        </div>
                        <div className="topbar__right">
                            <button className="topbar-button" style={{ marginRight: '8px' }}><Bell size={18} /><span className="notification-point"></span></button>
                            <UserProfileMenu />
                        </div>
                    </header>

                    <div className="content">
                        {/* PESTAÑA 1: DASHBOARD STATS */}
                        {/* PESTAÑA 1: GESTIÓN DE CAMPUS, FACULTADES Y CARRERAS */}
                        {activeTab === 'campus' && (
                            <div>
                                {/* BANNERS DE BIENVENIDA */}
                                <section className="page-hero">
                                    <div>
                                        <span className="page-hero__label"><Building2 size={14} style={{ marginRight: '6px', display: 'inline' }} /> Infraestructura Institucional</span>
                                        <h2>Gestión de Campus, Facultades y Carreras</h2>
                                        <p>Administra la estructura académica y sedes universitarias registradas en el sistema de Bienestar Universitario.</p>
                                    </div>
                                    <div className="page-hero__icon"><School size={34} /></div>
                                </section>

                                {/* SUBTABS DE NAVEGACIÓN Y ACCIONES */}
                                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                    <div className="nurse-card" style={{ display: 'inline-flex', padding: '6px', gap: '6px', margin: 0 }}>
                                        <button
                                            className={`action-button ${campusSubTab === 'campus' ? 'action-button--primary' : 'action-button--light'}`}
                                            onClick={() => setCampusSubTab('campus')}
                                            style={{ height: '36px', borderRadius: '10px' }}
                                        >
                                            <Building2 size={15} /> Campus (Sedes) ({campusList.length})
                                        </button>
                                        <button
                                            className={`action-button ${campusSubTab === 'facultades' ? 'action-button--primary' : 'action-button--light'}`}
                                            onClick={() => setCampusSubTab('facultades')}
                                            style={{ height: '36px', borderRadius: '10px' }}
                                        >
                                            <Landmark size={15} /> Facultades ({facultadesList.length})
                                        </button>
                                        <button
                                            className={`action-button ${campusSubTab === 'carreras' ? 'action-button--primary' : 'action-button--light'}`}
                                            onClick={() => setCampusSubTab('carreras')}
                                            style={{ height: '36px', borderRadius: '10px' }}
                                        >
                                            <GraduationCap size={15} /> Carreras ({carrerasList.length})
                                        </button>
                                    </div>

                                    {/* BOTÓN NUEVO SEGÚN SUBTAB */}
                                    {campusSubTab === 'campus' && (
                                        <button className="action-button action-button--primary" onClick={() => handleOpenCampusModal()} style={{ height: '40px' }}>
                                            <Plus size={16} /> Nuevo Campus
                                        </button>
                                    )}
                                    {campusSubTab === 'facultades' && (
                                        <button className="action-button action-button--primary" onClick={() => handleOpenFacultadModal()} style={{ height: '40px' }}>
                                            <Plus size={16} /> Nueva Facultad
                                        </button>
                                    )}
                                    {campusSubTab === 'carreras' && (
                                        <button className="action-button action-button--primary" onClick={() => handleOpenCarreraModal()} style={{ height: '40px' }}>
                                            <Plus size={16} /> Nueva Carrera
                                        </button>
                                    )}
                                </div>

                                {/* CONTENIDO VISTA CAMPUS (SEDES) */}
                                {campusSubTab === 'campus' && (
                                    <section className="nurse-card" style={{ marginTop: '20px', padding: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <div className="patient-search-input" style={{ width: '320px' }}>
                                                <Search size={16} />
                                                <input
                                                    value={campusSearch}
                                                    onChange={(e) => setCampusSearch(e.target.value)}
                                                    placeholder="Buscar campus o sede..."
                                                />
                                            </div>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mostrando {campusList.filter(c => !campusSearch || c.nombre.toLowerCase().includes(campusSearch.toLowerCase())).length} sedes</span>
                                        </div>

                                        <div className="table-wrapper">
                                            {campusLoading ? (
                                                <div style={{ textAlign: 'center', padding: '40px' }}><span className="spinner"></span></div>
                                            ) : campusList.filter(c => !campusSearch || c.nombre.toLowerCase().includes(campusSearch.toLowerCase())).length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No hay campus registrados que coincidan.</div>
                                            ) : (
                                                <table className="clinical-table">
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '80px' }}>ID</th>
                                                            <th>Nombre del Campus / Sede Universitaria</th>
                                                            <th style={{ textAlign: 'right' }}>Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {campusList.filter(c => !campusSearch || c.nombre.toLowerCase().includes(campusSearch.toLowerCase())).map((c) => (
                                                            <tr key={c.id}>
                                                                <td><strong>#{c.id}</strong></td>
                                                                <td>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
                                                                            <Building2 size={16} />
                                                                        </div>
                                                                        <strong>{c.nombre}</strong>
                                                                    </div>
                                                                </td>
                                                                <td style={{ textAlign: 'right' }}>
                                                                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                                        <button className="icon-action" title="Editar Campus" onClick={() => handleOpenCampusModal(c)} style={{ color: 'var(--primary)' }}>
                                                                            <Edit3 size={14} />
                                                                        </button>
                                                                        <button className="icon-action" title="Eliminar Campus" onClick={() => handleDeleteCampus(c)} style={{ color: '#b71a34' }}>
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </section>
                                )}

                                {/* CONTENIDO VISTA FACULTADES */}
                                {campusSubTab === 'facultades' && (
                                    <section className="nurse-card" style={{ marginTop: '20px', padding: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <div className="patient-search-input" style={{ width: '320px' }}>
                                                <Search size={16} />
                                                <input
                                                    value={facultadSearch}
                                                    onChange={(e) => setFacultadSearch(e.target.value)}
                                                    placeholder="Buscar facultad..."
                                                />
                                            </div>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total {facultadesList.length} facultades</span>
                                        </div>

                                        <div className="table-wrapper">
                                            {campusLoading ? (
                                                <div style={{ textAlign: 'center', padding: '40px' }}><span className="spinner"></span></div>
                                            ) : facultadesList.filter(f => !facultadSearch || f.nombre.toLowerCase().includes(facultadSearch.toLowerCase())).length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No hay facultades registradas que coincidan.</div>
                                            ) : (
                                                <table className="clinical-table">
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '80px' }}>ID</th>
                                                            <th>Nombre de la Facultad</th>
                                                            <th>Carreras Asociadas</th>
                                                            <th style={{ textAlign: 'right' }}>Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {facultadesList.filter(f => !facultadSearch || f.nombre.toLowerCase().includes(facultadSearch.toLowerCase())).map((f) => (
                                                            <tr key={f.id}>
                                                                <td><strong>#{f.id}</strong></td>
                                                                <td>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'grid', placeItems: 'center', color: '#166534' }}>
                                                                            <Landmark size={16} />
                                                                        </div>
                                                                        <strong>{f.nombre}</strong>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span className="status-badge status-badge--active" style={{ fontSize: '11px' }}>
                                                                        {f.carreras_count !== undefined ? f.carreras_count : carrerasList.filter(c => String(c.id_facultad) === String(f.id)).length} carreras
                                                                    </span>
                                                                </td>
                                                                <td style={{ textAlign: 'right' }}>
                                                                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                                        <button className="icon-action" title="Editar Facultad" onClick={() => handleOpenFacultadModal(f)} style={{ color: 'var(--primary)' }}>
                                                                            <Edit3 size={14} />
                                                                        </button>
                                                                        <button className="icon-action" title="Eliminar Facultad" onClick={() => handleDeleteFacultad(f)} style={{ color: '#b71a34' }}>
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </section>
                                )}

                                {/* CONTENIDO VISTA CARRERAS */}
                                {campusSubTab === 'carreras' && (
                                    <section className="nurse-card" style={{ marginTop: '20px', padding: '24px' }}>
                                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
                                            <div className="patient-search-input" style={{ flex: 1, minWidth: '240px' }}>
                                                <Search size={16} />
                                                <input
                                                    value={carreraSearch}
                                                    onChange={(e) => setCarreraSearch(e.target.value)}
                                                    placeholder="Buscar carrera universitaria..."
                                                />
                                            </div>
                                            <select
                                                value={carreraFacultadFilter}
                                                onChange={(e) => setCarreraFacultadFilter(e.target.value)}
                                                style={{ padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}
                                            >
                                                <option value="all">Todas las Facultades</option>
                                                {facultadesList.map(f => (
                                                    <option key={f.id} value={f.id}>{f.nombre}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="table-wrapper">
                                            {campusLoading ? (
                                                <div style={{ textAlign: 'center', padding: '40px' }}><span className="spinner"></span></div>
                                            ) : carrerasList.filter(car => {
                                                const matchText = !carreraSearch || car.nombre.toLowerCase().includes(carreraSearch.toLowerCase());
                                                const matchFac = carreraFacultadFilter === 'all' || String(car.id_facultad) === String(carreraFacultadFilter);
                                                return matchText && matchFac;
                                            }).length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No hay carreras que coincidan con los filtros.</div>
                                            ) : (
                                                <table className="clinical-table">
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '80px' }}>ID</th>
                                                            <th>Nombre de la Carrera</th>
                                                            <th>Facultad Perteneciente</th>
                                                            <th style={{ textAlign: 'right' }}>Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {carrerasList.filter(car => {
                                                            const matchText = !carreraSearch || car.nombre.toLowerCase().includes(carreraSearch.toLowerCase());
                                                            const matchFac = carreraFacultadFilter === 'all' || String(car.id_facultad) === String(carreraFacultadFilter);
                                                            return matchText && matchFac;
                                                        }).map((car) => {
                                                            const parentFac = facultadesList.find(f => String(f.id) === String(car.id_facultad)) || car.facultad;
                                                            return (
                                                                <tr key={car.id}>
                                                                    <td><strong>#{car.id}</strong></td>
                                                                    <td>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', display: 'grid', placeItems: 'center', color: '#92400e' }}>
                                                                                <GraduationCap size={16} />
                                                                            </div>
                                                                            <strong>{car.nombre}</strong>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                                                            {parentFac?.nombre || `Facultad #${car.id_facultad}`}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ textAlign: 'right' }}>
                                                                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                                            <button className="icon-action" title="Editar Carrera" onClick={() => handleOpenCarreraModal(car)} style={{ color: 'var(--primary)' }}>
                                                                                <Edit3 size={14} />
                                                                            </button>
                                                                            <button className="icon-action" title="Eliminar Carrera" onClick={() => handleDeleteCarrera(car)} style={{ color: '#b71a34' }}>
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}

                        {/* PESTAÑA 2: GESTIÓN DE CUENTAS DE USUARIOS */}
                        {activeTab === 'users' && (
                            <div>
                                {/* BANNER DE BIENVENIDA A GESTIÓN DE USUARIOS */}
                                <section className="page-hero">
                                    <div>
                                        <span className="page-hero__label"><Users size={14} style={{ marginRight: '6px', display: 'inline' }} /> Administración del Sistema</span>
                                        <h2>Gestión de Cuentas y Roles de Usuarios</h2>
                                        <p>Administra las cuentas de personal de salud, estudiantes, docentes y personal administrativo del sistema de Bienestar Universitario.</p>
                                    </div>
                                    <div className="page-hero__icon"><Users size={34} /></div>
                                </section>

                                <section className="nurse-card history-filter-card" style={{ marginTop: '20px' }}>
                                    <div className="history-filters" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div className="patient-search-input" style={{ flex: 1, minWidth: '240px' }}>
                                            <Search size={16} />
                                            <input
                                                value={usersSearch}
                                                onChange={(e) => setUsersSearch(e.target.value)}
                                                placeholder="Buscar usuario por nombre, correo, cédula..."
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <select value={usersRoleFilter} onChange={(e) => setUsersRoleFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                                <option value="all">Todos los Roles</option>
                                                <option value="paciente">Paciente (Estudiante/Funcionario)</option>
                                                <option value="medico_general">Médico General</option>
                                                <option value="enfermero">Enfermero</option>
                                                <option value="psicologo">Psicólogo</option>
                                                <option value="odontologo">Odontólogo</option>
                                                <option value="medico_ocupacional">Médico Ocupacional</option>
                                                <option value="medico_coordinador">Médico Coordinador</option>
                                                <option value="administrador">Administrador</option>
                                            </select>
                                            <select value={usersStatusFilter} onChange={(e) => setUsersStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                                                <option value="all">Todos los Estados</option>
                                                <option value="active">Activos</option>
                                                <option value="inactive">Inactivos</option>
                                            </select>
                                            <button
                                                className="action-button action-button--primary"
                                                onClick={() => setIsCreateUserModalOpen(true)}
                                                style={{ height: '38px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                            >
                                                <UserPlus size={16} /> Nuevo Usuario
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                <section className="nurse-card" style={{ marginTop: '20px', padding: '24px' }}>
                                    <div className="table-wrapper">
                                        {usersLoading ? (
                                            <div style={{ textAlign: 'center', padding: '45px' }}><span className="spinner"></span></div>
                                        ) : getFilteredUsers().length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '45px', color: 'var(--text-muted)' }}>
                                                No se encontraron cuentas con los criterios de búsqueda.
                                            </div>
                                        ) : (
                                            <table className="clinical-table">
                                                <thead>
                                                    <tr>
                                                        <th>Usuario</th>
                                                        <th>Identificación (Cédula)</th>
                                                        <th>Correo Electrónico</th>
                                                        <th>Roles Asignados</th>
                                                        <th>Estado</th>
                                                        <th style={{ textAlign: 'right' }}>Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getFilteredUsers().map((u) => (
                                                        <tr key={u.id}>
                                                            <td>
                                                                <strong>{u.nombre_completo || u.name || 'Sin Nombre'}</strong>
                                                            </td>
                                                            <td>{u.numero_cedula || u.cedula || '—'}</td>
                                                            <td>{u.email}</td>
                                                            <td>
                                                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                                    {u.roles?.map((r, i) => {
                                                                        let roleLabel = r.replace('_', ' ');
                                                                        if (r === 'paciente') {
                                                                            const subType = u.id_tipo_usuario === 3 ? 'Docente' : u.id_tipo_usuario === 4 ? 'Administrativo' : u.id_tipo_usuario === 5 ? 'Código Trabajo' : 'Estudiante';
                                                                            roleLabel = `Paciente (${subType})`;
                                                                        }
                                                                        return (
                                                                            <span key={i} className="status-badge status-badge--active" style={{ background: '#f1f5f9', color: '#475569', fontSize: '9.5px', textTransform: 'capitalize' }}>
                                                                                {roleLabel}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className={`status-badge ${u.activo ? 'status-badge--active' : 'status-badge--inactive'}`}>
                                                                    {u.activo ? 'Activo' : 'Deshabilitado'}
                                                                </span>
                                                            </td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                                    <button className="icon-action" title="Editar Datos del Usuario" onClick={() => handleOpenEditUserModal(u)} style={{ color: 'var(--primary)' }}>
                                                                        <User size={14} />
                                                                    </button>
                                                                    <button className="icon-action" title={u.activo ? "Deshabilitar Cuenta" : "Habilitar Cuenta"} onClick={() => handleToggleUserStatus(u)} style={{ color: u.activo ? '#b71a34' : '#166534' }}>
                                                                        <Power size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}



                        {/* PESTAÑA 5: LOGS Y SEGURIDAD */}
                        {activeTab === 'logs' && (() => {
                            const filteredAudit = getFilteredAuditLogs();
                            const paginatedAudit = filteredAudit.slice((auditPage - 1) * LOGS_PER_PAGE, auditPage * LOGS_PER_PAGE);

                            const filteredLogin = getFilteredLoginAttempts();
                            const paginatedLogin = filteredLogin.slice((loginPage - 1) * LOGS_PER_PAGE, loginPage * LOGS_PER_PAGE);

                            const filteredSecurity = getFilteredSecurityLogs();
                            const paginatedSecurity = filteredSecurity.slice((securityPage - 1) * LOGS_PER_PAGE, securityPage * LOGS_PER_PAGE);

                            return (
                                <div>
                                    {/* HERO BANNER DE LOGS Y AUDITORÍA */}
                                    <section className="page-hero">
                                        <div>
                                            <span className="page-hero__label"><Shield size={14} style={{ marginRight: '6px', display: 'inline' }} /> Auditoría y Seguridad</span>
                                            <h2>Bitácora de Eventos y Auditoría</h2>
                                            <p>Monitoreo integral de operaciones en base de datos, intentos de autenticación y alertas de seguridad institucional.</p>
                                        </div>
                                        <div className="page-hero__icon"><History size={34} /></div>
                                    </section>

                                    {/* MICROPETAÑAS DE NAVEGACIÓN (ESTILO CAMPUS, FACULTADES Y CARRERAS) */}
                                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                        <div className="nurse-card" style={{ display: 'inline-flex', padding: '6px', gap: '6px', margin: 0 }}>
                                            <button
                                                className={`action-button ${logsSubTab === 'audit' ? 'action-button--primary' : 'action-button--light'}`}
                                                onClick={() => setLogsSubTab('audit')}
                                                style={{ height: '36px', borderRadius: '10px' }}
                                            >
                                                <History size={15} /> Logs de Auditoría ({filteredAudit.length})
                                            </button>
                                            <button
                                                className={`action-button ${logsSubTab === 'login' ? 'action-button--primary' : 'action-button--light'}`}
                                                onClick={() => setLogsSubTab('login')}
                                                style={{ height: '36px', borderRadius: '10px' }}
                                            >
                                                <Key size={15} /> Intentos de Login ({filteredLogin.length})
                                            </button>
                                            <button
                                                className={`action-button ${logsSubTab === 'security' ? 'action-button--primary' : 'action-button--light'}`}
                                                onClick={() => setLogsSubTab('security')}
                                                style={{ height: '36px', borderRadius: '10px' }}
                                            >
                                                <ShieldAlert size={15} /> Eventos de Seguridad ({filteredSecurity.length})
                                            </button>
                                        </div>

                                        <button
                                            onClick={fetchLogs}
                                            disabled={logsLoading}
                                            className="action-button action-button--light"
                                            style={{ height: '38px', borderRadius: '10px' }}
                                            title="Actualizar registros"
                                        >
                                            <RefreshCw size={15} className={logsLoading ? 'spinner' : ''} /> Actualizar Bitácoras
                                        </button>
                                    </div>

                                    {/* BARRA DE BÚSQUEDA GENERAL */}
                                    <div className="logs-search" style={{ marginTop: '16px' }}>
                                        <Search size={16} />
                                        <input
                                            value={logsSearchText}
                                            onChange={(e) => {
                                                setLogsSearchText(e.target.value);
                                                setAuditPage(1);
                                                setLoginPage(1);
                                                setSecurityPage(1);
                                            }}
                                            placeholder={`Buscar en ${logsSubTab === 'audit' ? 'auditoría' : logsSubTab === 'login' ? 'intentos de login' : 'eventos de seguridad'} por usuario, acción, IP o detalle...`}
                                        />
                                    </div>

                                    {/* MICROPETAÑA 1: LOGS DE AUDITORÍA */}
                                    {logsSubTab === 'audit' && (
                                        <section className="nurse-card" style={{ marginTop: '20px', padding: '24px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                                <div>
                                                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: 'var(--primary)' }}>
                                                        <History size={18} /> Logs de Auditoría del Sistema
                                                    </h3>
                                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                                        Historial de modificaciones, creaciones y acciones sobre la base de datos del sistema.
                                                    </p>
                                                </div>

                                                {/* Selector de Fecha y Contador */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                        <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Fecha:</span>
                                                        <input
                                                            type="date"
                                                            value={auditDateFilter}
                                                            onChange={(e) => {
                                                                setAuditDateFilter(e.target.value);
                                                                setAuditPage(1);
                                                            }}
                                                            style={{
                                                                border: 'none',
                                                                background: 'transparent',
                                                                fontSize: '11.5px',
                                                                color: 'var(--text-primary)',
                                                                outline: 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                            title="Filtrar auditoría por fecha"
                                                        />
                                                        {auditDateFilter && (
                                                            <button
                                                                type="button"
                                                                onClick={() => { setAuditDateFilter(''); setAuditPage(1); }}
                                                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                                                                title="Quitar filtro de fecha"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <span className="status-badge status-badge--active" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px' }}>
                                                        {filteredAudit.length} registros
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="table-wrapper">
                                                {logsLoading ? (
                                                    <div style={{ textAlign: 'center', padding: '40px' }}><span className="spinner"></span></div>
                                                ) : filteredAudit.length === 0 ? (
                                                    <div style={{ textAlign: 'center', padding: '35px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                                        No se encontraron registros de auditoría para los filtros aplicados.
                                                    </div>
                                                ) : (
                                                    <table className="clinical-table">
                                                        <thead>
                                                            <tr>
                                                                <th style={{ width: '60px' }}>#</th>
                                                                <th>Usuario / Responsable</th>
                                                                <th>Acción</th>
                                                                <th>Módulo / Recurso</th>
                                                                <th>Dirección IP</th>
                                                                <th>Fecha y Hora</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {paginatedAudit.map((log) => {
                                                                const badge = formatLogAction(log.action);
                                                                const shortModel = log.model_type ? log.model_type.split('\\').pop() : '—';
                                                                return (
                                                                    <tr key={log.id}>
                                                                        <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{log.id}</td>
                                                                        <td>
                                                                            <strong>{log.user?.nombre_completo || log.user?.name || log.user?.email || (log.user_id ? `Usuario #${log.user_id}` : 'Sistema')}</strong>
                                                                            {log.user?.email && (log.user?.name || log.user?.nombre_completo) && (
                                                                                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{log.user.email}</div>
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            <span
                                                                                className="status-badge"
                                                                                style={{ background: badge.bg, color: badge.color, fontSize: '10px', textTransform: 'capitalize' }}
                                                                            >
                                                                                {badge.label}
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <span style={{ fontFamily: 'monospace', fontSize: '11px', background: '#f8fafc', padding: '3px 7px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                                                                {shortModel}{log.model_id ? ` #${log.model_id}` : ''}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{log.ip_address || '—'}</td>
                                                                        <td style={{ color: 'var(--text-muted)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                                                                            {formatLogDate(log.created_at)}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>

                                            {renderPaginationBar(auditPage, filteredAudit.length, setAuditPage)}
                                        </section>
                                    )}

                                    {/* MICROPETAÑA 2: INTENTOS DE INICIO DE SESIÓN */}
                                    {logsSubTab === 'login' && (
                                        <section className="nurse-card" style={{ marginTop: '20px', padding: '24px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                                <div>
                                                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: 'var(--primary)' }}>
                                                        <Key size={18} /> Historial de Intentos de Autenticación
                                                    </h3>
                                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                                        Monitoreo de accesos al sistema, intentos fallidos y bloqueos por seguridad.
                                                    </p>
                                                </div>

                                                {/* Selector de Fecha y Contador */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                        <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Fecha:</span>
                                                        <input
                                                            type="date"
                                                            value={loginDateFilter}
                                                            onChange={(e) => {
                                                                setLoginDateFilter(e.target.value);
                                                                setLoginPage(1);
                                                            }}
                                                            style={{
                                                                border: 'none',
                                                                background: 'transparent',
                                                                fontSize: '11.5px',
                                                                color: 'var(--text-primary)',
                                                                outline: 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                            title="Filtrar intentos por fecha"
                                                        />
                                                        {loginDateFilter && (
                                                            <button
                                                                type="button"
                                                                onClick={() => { setLoginDateFilter(''); setLoginPage(1); }}
                                                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                                                                title="Quitar filtro de fecha"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <span className="status-badge status-badge--active" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px' }}>
                                                        {filteredLogin.length} intentos
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="table-wrapper">
                                                {logsLoading ? (
                                                    <div style={{ textAlign: 'center', padding: '40px' }}><span className="spinner"></span></div>
                                                ) : filteredLogin.length === 0 ? (
                                                    <div style={{ textAlign: 'center', padding: '35px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                                        No se encontraron intentos de inicio de sesión para los filtros aplicados.
                                                    </div>
                                                ) : (
                                                    <table className="clinical-table">
                                                        <thead>
                                                            <tr>
                                                                <th style={{ width: '60px' }}>#</th>
                                                                <th>Correo / Cuenta</th>
                                                                <th>Resultado</th>
                                                                <th>Dirección IP</th>
                                                                <th>Navegador / Dispositivo</th>
                                                                <th>Fecha y Hora</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {paginatedLogin.map((attempt) => {
                                                                const isSuccess = Boolean(attempt.success ?? attempt.successful);
                                                                return (
                                                                    <tr key={attempt.id}>
                                                                        <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{attempt.id}</td>
                                                                        <td>
                                                                            <strong>{attempt.email || '—'}</strong>
                                                                        </td>
                                                                        <td>
                                                                            <span
                                                                                className={`status-badge ${isSuccess ? 'status-badge--active' : 'status-badge--inactive'}`}
                                                                                style={{ fontSize: '10px' }}
                                                                            >
                                                                                {isSuccess ? '✓ Autenticación Exitosa' : '✗ Intento Fallido'}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{attempt.ip_address || '—'}</td>
                                                                        <td style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={attempt.user_agent}>
                                                                            {attempt.user_agent || '—'}
                                                                        </td>
                                                                        <td style={{ color: 'var(--text-muted)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                                                                            {formatLogDate(attempt.created_at)}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>

                                            {renderPaginationBar(loginPage, filteredLogin.length, setLoginPage)}
                                        </section>
                                    )}

                                    {/* MICROPETAÑA 3: EVENTOS DE SEGURIDAD */}
                                    {logsSubTab === 'security' && (
                                        <section className="nurse-card" style={{ marginTop: '20px', padding: '24px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                                <div>
                                                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: 'var(--primary)' }}>
                                                        <ShieldAlert size={18} /> Eventos y Alertas de Seguridad
                                                    </h3>
                                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                                        Registro de alertas perimetrales, bloqueos preventivos de IP y anomalías detectadas.
                                                    </p>
                                                </div>

                                                {/* Selector de Fecha y Contador */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                        <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Fecha:</span>
                                                        <input
                                                            type="date"
                                                            value={securityDateFilter}
                                                            onChange={(e) => {
                                                                setSecurityDateFilter(e.target.value);
                                                                setSecurityPage(1);
                                                            }}
                                                            style={{
                                                                border: 'none',
                                                                background: 'transparent',
                                                                fontSize: '11.5px',
                                                                color: 'var(--text-primary)',
                                                                outline: 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                            title="Filtrar eventos por fecha"
                                                        />
                                                        {securityDateFilter && (
                                                            <button
                                                                type="button"
                                                                onClick={() => { setSecurityDateFilter(''); setSecurityPage(1); }}
                                                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                                                                title="Quitar filtro de fecha"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <span className="status-badge status-badge--active" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px' }}>
                                                        {filteredSecurity.length} eventos
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="table-wrapper">
                                                {logsLoading ? (
                                                    <div style={{ textAlign: 'center', padding: '40px' }}><span className="spinner"></span></div>
                                                ) : filteredSecurity.length === 0 ? (
                                                    <div style={{ textAlign: 'center', padding: '35px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                                        No hay alertas ni eventos de seguridad para los filtros aplicados.
                                                    </div>
                                                ) : (
                                                    <table className="clinical-table">
                                                        <thead>
                                                            <tr>
                                                                <th style={{ width: '60px' }}>#</th>
                                                                <th>Tipo de Evento</th>
                                                                <th>Descripción</th>
                                                                <th>Usuario Asociado</th>
                                                                <th>Dirección IP</th>
                                                                <th>Fecha y Hora</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {paginatedSecurity.map((sec) => (
                                                                <tr key={sec.id}>
                                                                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{sec.id}</td>
                                                                    <td>
                                                                        <span className="status-badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: '10px' }}>
                                                                            {sec.event_type || 'Alerta'}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ fontSize: '11.5px' }}>{sec.description || '—'}</td>
                                                                    <td>{sec.user?.email || (sec.user_id ? `Usuario #${sec.user_id}` : '—')}</td>
                                                                    <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{sec.ip_address || '—'}</td>
                                                                    <td style={{ color: 'var(--text-muted)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                                                                        {formatLogDate(sec.created_at)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>

                                            {renderPaginationBar(securityPage, filteredSecurity.length, setSecurityPage)}
                                        </section>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </main>
            </div>

            {/* ==========================================
               MODAL: EDITAR DATOS Y ROL DEL USUARIO
            ========================================== */}
            {isEditUserModalOpen && selectedUser && (
                <div className="clinical-modal show" style={{ zIndex: 4000 }}>
                    <div className="clinical-modal__backdrop" onClick={() => { setIsEditUserModalOpen(false); setSelectedUser(null); }}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '460px' }}>
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <div className="clinical-modal__avatar"><User size={18} /></div>
                                <div>
                                    <span>Gestión de Usuario</span>
                                    <h2>Editar Datos del Usuario</h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" onClick={() => { setIsEditUserModalOpen(false); setSelectedUser(null); }}><X size={15} /></button>
                        </header>
                        <form onSubmit={handleSaveEditUser} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <label className="field">
                                <span>Nombre Completo / Usuario *</span>
                                <input
                                    type="text"
                                    value={editUserForm.name}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                                    placeholder="Nombre completo del usuario"
                                    required
                                />
                            </label>
                            <label className="field">
                                <span>Correo Electrónico *</span>
                                <input
                                    type="email"
                                    value={editUserForm.email}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                                    placeholder="correo@ueb.edu.ec"
                                    required
                                />
                            </label>
                            <label className="field">
                                <span>Tipo de Afiliación / Usuario *</span>
                                <select
                                    value={editUserForm.affiliationKey}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, affiliationKey: e.target.value })}
                                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                >
                                    {AFFILIATION_OPTIONS.map(opt => (
                                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="field">
                                <span>Nueva Contraseña (Opcional)</span>
                                <input
                                    type="password"
                                    value={editUserForm.password}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                                    placeholder="Dejar en blanco para conservar la actual"
                                    minLength={6}
                                />
                            </label>

                            {editUserForm.password && editUserForm.password.length > 0 && (
                                <PasswordRequirements password={editUserForm.password} />
                            )}

                            <footer style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button className="action-button action-button--light" type="button" onClick={() => { setIsEditUserModalOpen(false); setSelectedUser(null); }} style={{ flex: 1 }}>Cancelar</button>
                                <button className="action-button action-button--primary" type="submit" disabled={editUserLoading} style={{ flex: 1 }}>
                                    {editUserLoading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
            {/* ==========================================
               MODAL: CREAR / EDITAR CAMPUS
            ========================================== */}
            {isCampusModalOpen && (
                <div className="clinical-modal show" style={{ zIndex: 4000 }}>
                    <div className="clinical-modal__backdrop" onClick={() => setIsCampusModalOpen(false)}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '420px' }}>
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <div className="clinical-modal__avatar"><Building2 size={18} /></div>
                                <div>
                                    <span>Infraestructura Sede</span>
                                    <h2>{campusForm.id ? 'Editar Campus' : 'Registrar Nuevo Campus'}</h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" onClick={() => setIsCampusModalOpen(false)}><X size={15} /></button>
                        </header>
                        <form onSubmit={handleSaveCampus} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <label className="field">
                                <span>Nombre del Campus / Sede *</span>
                                <input
                                    type="text"
                                    value={campusForm.nombre}
                                    onChange={(e) => setCampusForm({ ...campusForm, nombre: e.target.value })}
                                    placeholder="Ej. Campus Guanujo, Campus Laguacoto"
                                    required
                                />
                            </label>
                            <footer style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button className="action-button action-button--light" type="button" onClick={() => setIsCampusModalOpen(false)} style={{ flex: 1 }}>Cancelar</button>
                                <button className="action-button action-button--primary" type="submit" disabled={campusFormLoading} style={{ flex: 1 }}>
                                    {campusFormLoading ? 'Guardando...' : 'Guardar Campus'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}

            {/* ==========================================
               MODAL: CREAR / EDITAR FACULTAD
            ========================================== */}
            {isFacultadModalOpen && (
                <div className="clinical-modal show" style={{ zIndex: 4000 }}>
                    <div className="clinical-modal__backdrop" onClick={() => setIsFacultadModalOpen(false)}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '420px' }}>
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <div className="clinical-modal__avatar"><Landmark size={18} /></div>
                                <div>
                                    <span>Estructura Académica</span>
                                    <h2>{facultadForm.id ? 'Editar Facultad' : 'Registrar Nueva Facultad'}</h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" onClick={() => setIsFacultadModalOpen(false)}><X size={15} /></button>
                        </header>
                        <form onSubmit={handleSaveFacultad} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <label className="field">
                                <span>Nombre de la Facultad *</span>
                                <input
                                    type="text"
                                    value={facultadForm.nombre}
                                    onChange={(e) => setFacultadForm({ ...facultadForm, nombre: e.target.value })}
                                    placeholder="Ej. Facultad de Ciencias de la Salud"
                                    required
                                />
                            </label>
                            <footer style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button className="action-button action-button--light" type="button" onClick={() => setIsFacultadModalOpen(false)} style={{ flex: 1 }}>Cancelar</button>
                                <button className="action-button action-button--primary" type="submit" disabled={facultadFormLoading} style={{ flex: 1 }}>
                                    {facultadFormLoading ? 'Guardando...' : 'Guardar Facultad'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}

            {/* ==========================================
               MODAL: CREAR / EDITAR CARRERA
            ========================================== */}
            {isCarreraModalOpen && (
                <div className="clinical-modal show" style={{ zIndex: 4000 }}>
                    <div className="clinical-modal__backdrop" onClick={() => setIsCarreraModalOpen(false)}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '440px' }}>
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <div className="clinical-modal__avatar"><GraduationCap size={18} /></div>
                                <div>
                                    <span>Carreras Universitarias</span>
                                    <h2>{carreraForm.id ? 'Editar Carrera' : 'Registrar Nueva Carrera'}</h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" onClick={() => setIsCarreraModalOpen(false)}><X size={15} /></button>
                        </header>
                        <form onSubmit={handleSaveCarrera} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <label className="field">
                                <span>Facultad Perteneciente *</span>
                                <select
                                    value={carreraForm.id_facultad}
                                    onChange={(e) => setCarreraForm({ ...carreraForm, id_facultad: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                >
                                    <option value="">Seleccione una facultad...</option>
                                    {facultadesList.map(f => (
                                        <option key={f.id} value={f.id}>{f.nombre}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="field">
                                <span>Nombre de la Carrera *</span>
                                <input
                                    type="text"
                                    value={carreraForm.nombre}
                                    onChange={(e) => setCarreraForm({ ...carreraForm, nombre: e.target.value })}
                                    placeholder="Ej. Medicina General, Enfermería"
                                    required
                                />
                            </label>
                            <footer style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button className="action-button action-button--light" type="button" onClick={() => setIsCarreraModalOpen(false)} style={{ flex: 1 }}>Cancelar</button>
                                <button className="action-button action-button--primary" type="submit" disabled={carreraFormLoading} style={{ flex: 1 }}>
                                    {carreraFormLoading ? 'Guardando...' : 'Guardar Carrera'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
            {/* ==========================================
               MODAL: CREAR / REGISTRAR NUEVO USUARIO
            ========================================== */}
            {isCreateUserModalOpen && (
                <div className="clinical-modal show" style={{ zIndex: 4000 }}>
                    <div className="clinical-modal__backdrop" onClick={() => setIsCreateUserModalOpen(false)}></div>
                    <div className="clinical-modal__dialog clinical-modal__dialog--compact" style={{ maxWidth: '480px' }}>
                        <header className="clinical-modal__header">
                            <div className="clinical-modal__patient">
                                <div className="clinical-modal__avatar"><UserPlus size={18} /></div>
                                <div>
                                    <span>Gestión de Usuarios</span>
                                    <h2>Registrar Nuevo Usuario</h2>
                                </div>
                            </div>
                            <button className="clinical-modal__close" onClick={() => setIsCreateUserModalOpen(false)}><X size={15} /></button>
                        </header>
                        <form onSubmit={handleCreateUser} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <label className="field">
                                    <span>Nombres *</span>
                                    <input
                                        value={registerForm.nombres}
                                        onChange={(e) => setRegisterForm({ ...registerForm, nombres: e.target.value })}
                                        placeholder="Ej. Juan Carlos"
                                        required
                                    />
                                </label>
                                <label className="field">
                                    <span>Apellidos *</span>
                                    <input
                                        value={registerForm.apellidos}
                                        onChange={(e) => setRegisterForm({ ...registerForm, apellidos: e.target.value })}
                                        placeholder="Ej. Pérez Gómez"
                                        required
                                    />
                                </label>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <label className="field">
                                    <span>Cédula de Identidad *</span>
                                    <input
                                        value={registerForm.cedula}
                                        onChange={(e) => setRegisterForm({ ...registerForm, cedula: e.target.value })}
                                        placeholder="Ej. 0205556677"
                                        required
                                    />
                                </label>
                                <label className="field">
                                    <span>Correo Institucional *</span>
                                    <input
                                        type="email"
                                        value={registerForm.correo}
                                        onChange={(e) => setRegisterForm({ ...registerForm, correo: e.target.value })}
                                        placeholder="usuario@ueb.edu.ec"
                                        required
                                    />
                                </label>
                            </div>

                            <label className="field">
                                <span>Tipo de Afiliación / Rol del Usuario *</span>
                                <select
                                    value={registerForm.affiliationKey}
                                    onChange={(e) => setRegisterForm({ ...registerForm, affiliationKey: e.target.value })}
                                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border)' }}
                                >
                                    {AFFILIATION_OPTIONS.map(opt => (
                                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                                    ))}
                                </select>
                            </label>

                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px', fontSize: '11px', color: '#475569' }}>
                                <strong style={{ color: 'var(--primary)' }}>Clave Inicial Temporal:</strong> Se generará automáticamente como <code>Ueb{registerForm.cedula || 'CEDULA'}*</code>. El usuario la cambiará en su primer inicio de sesión.
                            </div>

                            {registerError && (
                                <div style={{ color: '#b71a34', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#fff5f5', borderRadius: '10px', border: '1px solid #fecdd3' }}>
                                    <AlertTriangle size={14} /> {registerError}
                                </div>
                            )}

                            <footer style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button className="action-button action-button--light" type="button" onClick={() => setIsCreateUserModalOpen(false)} style={{ flex: 1 }}>Cancelar</button>
                                <button className="action-button action-button--primary" type="submit" disabled={registerLoading} style={{ flex: 1 }}>
                                    {registerLoading ? 'Guardando...' : 'Crear Usuario'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}

            {/* TOAST SYSTEM */}
            <div className={`toast ${toast.show ? 'show' : ''}`}>
                <CheckCircle size={16} />
                <span>{toast.message}</span>
            </div>

            {/* MODAL DE CONFIRMACIÓN CUSTOM */}
            {confirmModal.show && (
                <div className="modal show" style={{ zIndex: 5000 }}>
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

            {/* PANEL DE AYUDA */}
            <HelpPanel
                helpItems={[
                    { title: '¿Cómo interpretar el Dashboard?', content: 'El Resumen Estadístico muestra las métricas globales del período seleccionado. Ajusta el rango de fechas y presiona "Aplicar" para actualizar los datos. Los KPIs muestran el total de atenciones, pacientes únicos y cuentas activas.' },
                    { title: '¿Cómo gestionar cuentas de usuarios?', content: 'En "Gestión de Cuentas" puedes buscar usuarios por nombre, correo o cédula. Usa el ícono de llave para restablecer contraseñas, el de deslizadores para cambiar roles, y el de encendido para habilitar/deshabilitar cuentas.' },
                    { title: '¿Cómo registrar un nuevo usuario?', content: 'Ve a "Crear Cuenta" y completa el formulario con los datos del usuario. La contraseña temporal se genera automáticamente como: Ueb + cédula + *. El usuario deberá cambiarla en su primer inicio de sesión.' },
                    { title: '¿Cómo generar reportes?', content: 'En "Reportes Avanzados" selecciona el Área Clínica (Medicina, Enfermería, Psicología, Odontología), el rango de fechas y la dimensión de agrupamiento. Presiona "Analizar" para ver los datos. Usa el botón de descarga para obtener el reporte en PDF.' },
                    { title: '¿Qué son los Logs de Auditoría?', content: 'La Bitácora de Auditoría registra todos los cambios realizados en la base de datos. La Bitácora de Seguridad registra los intentos de inicio de sesión (exitosos y fallidos). Puedes filtrar por usuario, acción o dirección IP.' },
                ]}
                contactInfo={{ email: 'soporte@ueb.edu.ec' }}
            />
        </div>
    );
};

export default Administrador_page;
