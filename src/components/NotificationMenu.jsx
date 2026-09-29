import React, { useState, useEffect, useRef } from 'react';
import {
    Bell,
    CheckCheck,
    Calendar,
    CalendarPlus,
    CalendarX,
    UserCheck,
    Clock,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../stores/authStore';

const NotificationMenu = ({ onNavigateToCitas }) => {
    const { user } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('todas'); // 'todas' | 'no_leidas'
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const dropdownRef = useRef(null);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isPatient = user?.roles?.some(r => r.name === 'paciente') || user?.rol === 'paciente';

    // Cargar notificaciones
    const fetchNotifications = async () => {
        setLoading(true);
        const storageKey = `app_read_notifs_${user?.id || 'anon'}`;
        const readIds = JSON.parse(localStorage.getItem(storageKey) || '[]');

        try {
            // Intentar primero endpoint formal de notificaciones de Laravel
            const res = await api.get('/notificaciones');
            if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
                setNotifications(res.data.data);
                setLoading(false);
                return;
            }
        } catch {
            // Si el endpoint no existe en el backend aún o falla, sincronizar inteligentemente con las citas reales
        }

        try {
            // Fallback sincronizado con las citas médicas reales según el rol
            const todayStr = new Date().toISOString().slice(0, 10);
            const endpoint = isPatient ? '/citas-medicas/mis-citas' : '/citas-medicas/doctor/citas';
            const citasRes = await api.get(endpoint);
            const citas = citasRes.data?.data || [];

            const generatedNotifs = [];

            if (isPatient) {
                // Notificaciones para el paciente
                citas.forEach(cita => {
                    if (!cita.fecha) return;
                    const dIdent = cita.doctor?.datos_identificacion || cita.doctor?.datosIdentificacion || cita.doctor?.identification;
                    const doctorName = dIdent
                        ? `${dIdent.primer_nombre} ${dIdent.apellido_paterno}`
                        : cita.doctor?.name || 'Especialista';

                    const citaFechaStr = String(cita.fecha).slice(0, 10);

                    if (cita.estado === 'programada' || cita.estado === 'confirmada') {
                        const notifId = `prog_${cita.id}`;
                        generatedNotifs.push({
                            id: notifId,
                            tipo: 'cita_agendada',
                            titulo: cita.estado === 'confirmada' ? 'Cita Confirmada' : 'Cita Reservada con Éxito',
                            mensaje: `Tienes cita médica programada con ${doctorName} para el ${citaFechaStr} (${cita.hora_inicio || 'Horario pactado'}).`,
                            fecha_cita: citaFechaStr,
                            hora_cita: cita.hora_inicio ? `${cita.hora_inicio} - ${cita.hora_fin || ''}` : '',
                            doctor_nombre: doctorName,
                            cita_id: cita.id,
                            leida: readIds.includes(notifId),
                            creada_en: citaFechaStr === todayStr ? 'Hoy' : citaFechaStr,
                            timestamp: new Date(citaFechaStr).getTime()
                        });
                    } else if (cita.estado === 'completada') {
                        const notifId = `comp_${cita.id}`;
                        generatedNotifs.push({
                            id: notifId,
                            tipo: 'atencion_completada',
                            titulo: 'Atención Médica Completada',
                            mensaje: `Tu consulta médica con ${doctorName} del ${citaFechaStr} ha sido completada exitosamente.`,
                            fecha_cita: citaFechaStr,
                            hora_cita: cita.hora_inicio,
                            doctor_nombre: doctorName,
                            cita_id: cita.id,
                            leida: readIds.includes(notifId),
                            creada_en: citaFechaStr === todayStr ? 'Hoy' : citaFechaStr,
                            timestamp: new Date(citaFechaStr).getTime()
                        });
                    } else if (cita.estado === 'cancelada') {
                        const notifId = `canc_${cita.id}`;
                        generatedNotifs.push({
                            id: notifId,
                            tipo: 'cita_cancelada',
                            titulo: 'Cita Cancelada',
                            mensaje: `La cita programada con ${doctorName} del ${citaFechaStr} fue cancelada.`,
                            fecha_cita: citaFechaStr,
                            hora_cita: cita.hora_inicio,
                            doctor_nombre: doctorName,
                            cita_id: cita.id,
                            leida: readIds.includes(notifId),
                            creada_en: citaFechaStr === todayStr ? 'Hoy' : citaFechaStr,
                            timestamp: new Date(citaFechaStr).getTime()
                        });
                    }
                });
            } else {
                // Notificaciones para el profesional de salud
                // 1. Resumen de la jornada de hoy
                const citasHoy = citas.filter(c => c.fecha && String(c.fecha).slice(0, 10) === todayStr && c.estado !== 'cancelada');
                if (citasHoy.length > 0) {
                    const notifId = `resumen_${todayStr}`;
                    generatedNotifs.push({
                        id: notifId,
                        tipo: 'resumen_jornada',
                        titulo: 'Agenda del Día de Hoy',
                        mensaje: `Tienes ${citasHoy.length} ${citasHoy.length === 1 ? 'consulta médica programada' : 'consultas médicas programadas'} para la jornada de hoy.`,
                        fecha_cita: todayStr,
                        hora_cita: citasHoy[0]?.hora_inicio ? `${citasHoy[0].hora_inicio} en adelante` : '',
                        paciente_nombre: `${citasHoy.length} pacientes citados`,
                        leida: readIds.includes(notifId),
                        creada_en: 'Hoy',
                        timestamp: new Date().setHours(7, 30, 0, 0)
                    });
                }

                // 2. Citas programadas, canceladas o confirmadas
                citas.forEach(cita => {
                    if (!cita.fecha) return;
                    const pIdent = cita.paciente?.datos_identificacion || cita.paciente?.datosIdentificacion || cita.paciente?.identification;
                    const patientName = pIdent
                        ? `${pIdent.primer_nombre} ${pIdent.apellido_paterno}`
                        : cita.paciente?.name || 'Paciente';

                    const citaFechaStr = String(cita.fecha).slice(0, 10);

                    if (cita.estado === 'programada') {
                        const notifId = `prog_${cita.id}`;
                        generatedNotifs.push({
                            id: notifId,
                            tipo: 'nueva_cita',
                            titulo: 'Nueva Cita Agendada',
                            mensaje: `${patientName} agendó cita médica para el ${citaFechaStr} (${cita.hora_inicio || 'Horario por definir'}). Motivo: ${cita.motivo || 'Consulta general'}.`,
                            fecha_cita: citaFechaStr,
                            hora_cita: cita.hora_inicio ? `${cita.hora_inicio} - ${cita.hora_fin || ''}` : '',
                            paciente_nombre: patientName,
                            cita_id: cita.id,
                            leida: readIds.includes(notifId),
                            creada_en: citaFechaStr === todayStr ? 'Hoy' : citaFechaStr,
                            timestamp: new Date(citaFechaStr).getTime()
                        });
                    } else if (cita.estado === 'cancelada') {
                        const notifId = `canc_${cita.id}`;
                        generatedNotifs.push({
                            id: notifId,
                            tipo: 'cita_cancelada',
                            titulo: 'Cita Cancelada',
                            mensaje: `${patientName} canceló su cita del ${citaFechaStr} (${cita.hora_inicio || ''}). El cupo de atención ha sido liberado.`,
                            fecha_cita: citaFechaStr,
                            hora_cita: cita.hora_inicio,
                            paciente_nombre: patientName,
                            cita_id: cita.id,
                            leida: readIds.includes(notifId),
                            creada_en: citaFechaStr === todayStr ? 'Hoy' : citaFechaStr,
                            timestamp: new Date(citaFechaStr).getTime()
                        });
                    } else if (cita.estado === 'confirmada') {
                        const notifId = `conf_${cita.id}`;
                        generatedNotifs.push({
                            id: notifId,
                            tipo: 'asistencia_confirmada',
                            titulo: 'Asistencia Confirmada',
                            mensaje: `${patientName} ha confirmado su asistencia para la cita del ${citaFechaStr} a las ${cita.hora_inicio}.`,
                            fecha_cita: citaFechaStr,
                            hora_cita: cita.hora_inicio,
                            paciente_nombre: patientName,
                            cita_id: cita.id,
                            leida: readIds.includes(notifId),
                            creada_en: citaFechaStr === todayStr ? 'Hoy' : citaFechaStr,
                            timestamp: new Date(citaFechaStr).getTime()
                        });
                    }
                });
            }

            // Ordenar: no leídas primero y más recientes primero
            generatedNotifs.sort((a, b) => {
                if (a.leida !== b.leida) return a.leida ? 1 : -1;
                return b.timestamp - a.timestamp;
            });

            setNotifications(generatedNotifs);
        } catch (err) {
            console.error("Error al cargar notificaciones de citas:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Recargar periódicamente cada 30 segundos
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const markAsRead = async (id) => {
        const storageKey = `app_read_notifs_${user?.id || 'anon'}`;
        const readIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!readIds.includes(id)) {
            readIds.push(id);
            localStorage.setItem(storageKey, JSON.stringify(readIds));
        }

        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, leida: true } : n)
        );

        try {
            await api.patch(`/notificaciones/${id}/leer`);
        } catch {
            // Ignorar error si el id es local o temporal
        }
    };

    const markAllAsRead = async () => {
        const storageKey = `app_read_notifs_${user?.id || 'anon'}`;
        const allIds = notifications.map(n => n.id);
        localStorage.setItem(storageKey, JSON.stringify(allIds));

        setNotifications(prev => prev.map(n => ({ ...n, leida: true })));

        try {
            await api.patch('/notificaciones/marcar-todas-leidas');
        } catch {
            // Ignorar
        }
    };

    const handleNotificationClick = (notif) => {
        markAsRead(notif.id);
        setIsOpen(false);
        if (onNavigateToCitas) {
            onNavigateToCitas(notif.fecha_cita, notif.cita_id);
        }
    };

    const unreadCount = notifications.filter(n => !n.leida).length;
    const filteredNotifications = filter === 'no_leidas'
        ? notifications.filter(n => !n.leida)
        : notifications;

    // Configuración visual por tipo de notificación
    const getNotificationBadge = (tipo) => {
        switch (tipo) {
            case 'nueva_cita':
                return {
                    icon: <CalendarPlus size={16} color="#0284c7" />,
                    bg: '#e0f2fe',
                    border: '#bae6fd',
                    badgeText: 'Nueva Cita',
                    badgeColor: '#0369a1'
                };
            case 'cita_agendada':
                return {
                    icon: <CalendarPlus size={16} color="#059669" />,
                    bg: '#d1fae5',
                    border: '#a7f3d0',
                    badgeText: 'Cita Reservada',
                    badgeColor: '#047857'
                };
            case 'cita_cancelada':
                return {
                    icon: <CalendarX size={16} color="#b71a34" />,
                    bg: '#fee2e2',
                    border: '#fecaca',
                    badgeText: 'Cancelada',
                    badgeColor: '#b71a34'
                };
            case 'asistencia_confirmada':
                return {
                    icon: <UserCheck size={16} color="#059669" />,
                    bg: '#d1fae5',
                    border: '#a7f3d0',
                    badgeText: 'Confirmada',
                    badgeColor: '#047857'
                };
            case 'atencion_completada':
                return {
                    icon: <CheckCheck size={16} color="#0d9488" />,
                    bg: '#ccfbf1',
                    border: '#99f6e4',
                    badgeText: 'Atención Lista',
                    badgeColor: '#0f766e'
                };
            case 'resumen_jornada':
            default:
                return {
                    icon: <Calendar size={16} color="#4338ca" />,
                    bg: '#e0e7ff',
                    border: '#c7d2fe',
                    badgeText: 'Agenda del Día',
                    badgeColor: '#3730a3'
                };
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            {/* BOTON DE CAMPANA EN TOPBAR */}
            <button
                type="button"
                className="topbar-button"
                style={{ marginRight: '8px' }}
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) fetchNotifications();
                }}
                title={unreadCount > 0 ? `${unreadCount} notificaciones de citas sin leer` : 'Notificaciones de agenda'}
                aria-label="Notificaciones de citas"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span
                        className="notification-point"
                        style={{
                            minWidth: unreadCount > 9 ? '18px' : '9px',
                            height: unreadCount > 9 ? '18px' : '9px',
                            borderRadius: '10px',
                            background: 'var(--accent, #b71a34)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: '800',
                            padding: unreadCount > 9 ? '0 4px' : '0',
                            top: unreadCount > 9 ? '4px' : '8px',
                            right: unreadCount > 9 ? '4px' : '8px',
                            boxShadow: '0 2px 6px rgba(183, 26, 52, 0.4)'
                        }}
                    >
                        {unreadCount > 9 ? '9+' : ''}
                    </span>
                )}
            </button>

            {/* DROPDOWN POPUP DE NOTIFICACIONES */}
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: '0',
                        width: '380px',
                        maxWidth: '92vw',
                        background: '#ffffff',
                        borderRadius: '18px',
                        border: '1px solid rgba(0, 32, 64, 0.12)',
                        boxShadow: '0 16px 40px rgba(0, 32, 64, 0.16)',
                        zIndex: 9999,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        animation: 'fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                    }}
                >
                    {/* CABECERA */}
                    <div
                        style={{
                            padding: '16px 18px 12px 18px',
                            borderBottom: '1px solid rgba(0, 32, 64, 0.08)',
                            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                                style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '8px',
                                    background: 'var(--primary-soft, #f0f4f8)',
                                    display: 'grid',
                                    placeItems: 'center',
                                    color: 'var(--primary, #002040)'
                                }}
                            >
                                <Bell size={16} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '13.5px', fontWeight: '800', color: 'var(--primary, #002040)' }}>
                                    {isPatient ? 'Mis Citas y Notificaciones' : 'Notificaciones de Agenda'}
                                </h3>
                                <p style={{ margin: 0, fontSize: '10.5px', color: 'var(--text-muted)' }}>
                                    {unreadCount > 0
                                        ? `${unreadCount} alertas sin revisar`
                                        : (isPatient ? 'Todo al día con tus citas' : 'Todo al día en tu agenda')}
                                </p>
                            </div>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: 'var(--primary, #002040)',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s'
                                }}
                                title="Marcar todas como leídas"
                            >
                                <CheckCheck size={14} color="var(--primary)" />
                                <span>Marcar leídas</span>
                            </button>
                        )}
                    </div>

                    {/* FILTROS (TODAS / NO LEIDAS) */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '6px',
                            padding: '8px 18px',
                            background: '#f8fafc',
                            borderBottom: '1px solid rgba(0, 32, 64, 0.06)'
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setFilter('todas')}
                            style={{
                                border: 'none',
                                background: filter === 'todas' ? '#ffffff' : 'transparent',
                                color: filter === 'todas' ? 'var(--primary)' : 'var(--text-muted)',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: filter === 'todas' ? '750' : '600',
                                cursor: 'pointer',
                                boxShadow: filter === 'todas' ? '0 1px 4px rgba(0, 32, 64, 0.08)' : 'none'
                            }}
                        >
                            Todas ({notifications.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter('no_leidas')}
                            style={{
                                border: 'none',
                                background: filter === 'no_leidas' ? '#ffffff' : 'transparent',
                                color: filter === 'no_leidas' ? 'var(--accent, #b71a34)' : 'var(--text-muted)',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: filter === 'no_leidas' ? '750' : '600',
                                cursor: 'pointer',
                                boxShadow: filter === 'no_leidas' ? '0 1px 4px rgba(0, 32, 64, 0.08)' : 'none'
                            }}
                        >
                            No leídas ({unreadCount})
                        </button>
                    </div>

                    {/* LISTA DE NOTIFICACIONES */}
                    <div
                        style={{
                            maxHeight: '380px',
                            overflowY: 'auto',
                            padding: '6px 0'
                        }}
                    >
                        {loading && notifications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                Sincronizando agenda...
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '36px 18px', color: 'var(--text-muted)' }}>
                                <Sparkles size={28} color="var(--accent)" style={{ margin: '0 auto 8px', opacity: 0.6 }} />
                                <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text)' }}>
                                    {filter === 'no_leidas' ? 'No tienes alertas pendientes' : 'Sin notificaciones de citas'}
                                </strong>
                                <span style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                                    {filter === 'no_leidas'
                                        ? 'Has revisado todas las novedades de tus citas.'
                                        : 'Las nuevas reservas y cancelaciones aparecerán aquí.'}
                                </span>
                            </div>
                        ) : (
                            filteredNotifications.map((notif) => {
                                const badge = getNotificationBadge(notif.tipo);
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        style={{
                                            padding: '12px 18px',
                                            display: 'flex',
                                            gap: '12px',
                                            alignItems: 'flex-start',
                                            cursor: 'pointer',
                                            background: notif.leida ? 'transparent' : 'rgba(239, 246, 255, 0.6)',
                                            borderBottom: '1px solid rgba(0, 32, 64, 0.04)',
                                            transition: 'background 0.2s ease',
                                            position: 'relative'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = notif.leida ? 'transparent' : 'rgba(239, 246, 255, 0.6)'}
                                    >
                                        {/* ICONO */}
                                        <div
                                            style={{
                                                width: '34px',
                                                height: '34px',
                                                borderRadius: '10px',
                                                background: badge.bg,
                                                border: `1px solid ${badge.border}`,
                                                display: 'grid',
                                                placeItems: 'center',
                                                flexShrink: 0,
                                                marginTop: '2px'
                                            }}
                                        >
                                            {badge.icon}
                                        </div>

                                        {/* TEXTO */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                                <span
                                                    style={{
                                                        fontSize: '9.5px',
                                                        fontWeight: '800',
                                                        textTransform: 'uppercase',
                                                        color: badge.badgeColor,
                                                        letterSpacing: '0.4px'
                                                    }}
                                                >
                                                    {badge.badgeText}
                                                </span>
                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                                    {notif.creada_en}
                                                </span>
                                            </div>

                                            <h4
                                                style={{
                                                    margin: '2px 0 3px',
                                                    fontSize: '12.5px',
                                                    fontWeight: notif.leida ? '650' : '800',
                                                    color: 'var(--text-primary)'
                                                }}
                                            >
                                                {notif.titulo}
                                            </h4>

                                            <p
                                                style={{
                                                    margin: '0',
                                                    fontSize: '11px',
                                                    color: 'var(--text-secondary)',
                                                    lineHeight: '1.45'
                                                }}
                                            >
                                                {notif.mensaje}
                                            </p>

                                            {notif.hora_cita && (
                                                <div
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontSize: '10.5px',
                                                        color: 'var(--primary)',
                                                        fontWeight: '700',
                                                        marginTop: '6px',
                                                        background: 'rgba(0, 32, 64, 0.05)',
                                                        padding: '2px 8px',
                                                        borderRadius: '6px'
                                                    }}
                                                >
                                                    <Clock size={11} color="var(--primary)" />
                                                    <span>{notif.hora_cita}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* INDICADOR NO LEIDA */}
                                        {!notif.leida && (
                                            <span
                                                style={{
                                                    width: '7px',
                                                    height: '7px',
                                                    borderRadius: '50%',
                                                    background: 'var(--accent, #b71a34)',
                                                    flexShrink: 0,
                                                    marginTop: '6px'
                                                }}
                                                title="No leída"
                                            />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* PIE DEL MENU */}
                    <div
                        style={{
                            padding: '10px 18px',
                            borderTop: '1px solid rgba(0, 32, 64, 0.08)',
                            background: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                if (onNavigateToCitas) {
                                    onNavigateToCitas(new Date().toISOString().slice(0, 10));
                                }
                            }}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--accent, #b71a34)',
                                fontSize: '11.5px',
                                fontWeight: '750',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 0'
                            }}
                        >
                            <span>{isPatient ? 'Ver Mis Citas Médicas' : 'Ir a Gestión de Citas'}</span>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationMenu;
