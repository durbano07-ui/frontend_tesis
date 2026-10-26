import { useState, useEffect, useMemo } from 'react';
import { UserCheck } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import api from '../api/axios';

const TIPO_ESTUDIANTE = 2;
// Tipos que puede elegir un paciente (1 = Médico es solo para el personal)
const TIPOS_PACIENTE = [2, 3, 4, 5];

const fieldStyle = (hasError) => ({
    width: '100%', padding: '12px 14px', borderRadius: '12px',
    border: `1.5px solid ${hasError ? '#ef4444' : 'var(--border, #e5e7eb)'}`,
    background: 'var(--input-bg, #f9fafb)', fontSize: '14px',
    color: 'var(--text-primary, #111)', outline: 'none', boxSizing: 'border-box',
});

const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary, #555)' };

/**
 * Aviso obligatorio para que cada paciente confirme su tipo de usuario. El registro asumía
 * "estudiante" por defecto, así que se pregunta a todos y se sobrescriben los datos.
 * Estudiante: además carrera y ciclo. Docente, administrativo y código de trabajo: nada más.
 * Mismo diseño que CedulaCorreccionModal.
 */
const TipoUsuarioModal = () => {
    const { user } = useAuthStore();
    const [show, setShow] = useState(false);
    const [catalogos, setCatalogos] = useState({ tipos: [], carreras: [], facultades: [], ciclos: [] });
    const [form, setForm] = useState({ id_tipo_usuario: '', id_facultad: '', id_carrera: '', id_ciclo: '' });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
        api.get('/user-profile/tipo-usuario-estado')
            .then(async (res) => {
                if (!res.data?.data?.requiere_confirmacion) return;
                const cat = (await api.get('/user-profile/catalogos')).data || {};
                setCatalogos({
                    tipos: (cat.tipos_usuario || []).filter(t => TIPOS_PACIENTE.includes(Number(t.id))).sort((a, b) => a.id - b.id),
                    carreras: cat.carreras || [],
                    facultades: cat.facultades || [],
                    ciclos: cat.ciclos || [],
                });
                // No se precarga el tipo actual: el objetivo es que la persona lo elija conscientemente
                setShow(true);
            })
            .catch(() => { /* si falla la consulta no se bloquea al usuario */ });
    }, [user?.id]);

    // Solo facultades que tienen carreras, y solo las carreras de la facultad elegida
    const facultadesConCarreras = useMemo(() => catalogos.facultades
        .filter(f => catalogos.carreras.some(c => Number(c.id_facultad) === Number(f.id))), [catalogos]);
    const carrerasDeFacultad = useMemo(() => catalogos.carreras
        .filter(c => Number(c.id_facultad) === Number(form.id_facultad))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')), [catalogos, form.id_facultad]);

    const esEstudiante = Number(form.id_tipo_usuario) === TIPO_ESTUDIANTE;
    const completo = form.id_tipo_usuario && (!esEstudiante || (form.id_facultad && form.id_carrera && form.id_ciclo));

    const handleSave = async () => {
        const next = {};
        if (!form.id_tipo_usuario) next.id_tipo_usuario = 'Selecciona una opción.';
        if (esEstudiante && !form.id_facultad) next.id_facultad = 'Selecciona tu facultad.';
        if (esEstudiante && !form.id_carrera) next.id_carrera = 'Selecciona tu carrera.';
        if (esEstudiante && !form.id_ciclo) next.id_ciclo = 'Selecciona tu ciclo.';
        setErrors(next);
        if (Object.keys(next).length) return;

        setSaving(true);
        try {
            await api.put('/user-profile/tipo-usuario', {
                id_tipo_usuario: Number(form.id_tipo_usuario),
                id_carrera: esEstudiante ? Number(form.id_carrera) : null,
                id_ciclo: esEstudiante ? Number(form.id_ciclo) : null,
            });
            setShow(false);
            window.dispatchEvent(new CustomEvent('tipo-usuario-confirmado'));
        } catch (err) {
            const data = err.response?.data;
            setErrors(data?.errors
                ? Object.fromEntries(Object.entries(data.errors).map(([k, v]) => [k, v[0]]))
                : { general: data?.message || 'No se pudo guardar. Intenta de nuevo.' });
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="tipo-usuario-titulo" aria-describedby="tipo-usuario-desc" style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(10, 15, 30, 0.80)', backdropFilter: 'blur(8px)' }} />
            <div style={{
                position: 'relative', zIndex: 1, background: 'var(--surface, #fff)',
                borderRadius: '20px', padding: '36px 32px', maxWidth: '480px', width: '100%',
                maxHeight: 'calc(100vh - 32px)', overflowY: 'auto',
                boxShadow: '0 24px 60px rgba(0,0,0,0.35)', border: '1px solid var(--border, #e5e7eb)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-soft, #eff6ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                    }}>
                        <UserCheck size={28} style={{ color: 'var(--primary, #1d4ed8)' }} />
                    </div>
                    <h2 id="tipo-usuario-titulo" style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary, #111)' }}>
                        Confirma tu vínculo con la universidad
                    </h2>
                    <p id="tipo-usuario-desc" style={{ margin: 0, color: 'var(--text-secondary, #555)', fontSize: '14px', lineHeight: 1.6 }}>
                        Para registrar correctamente tus atenciones, indícanos si eres estudiante, docente, personal administrativo o de código de trabajo.
                    </p>
                </div>

                <label style={{ display: 'block', marginBottom: '18px' }}>
                    <span style={labelStyle}>Soy</span>
                    <select
                        autoFocus
                        value={form.id_tipo_usuario}
                        aria-invalid={!!errors.id_tipo_usuario}
                        onChange={(e) => { setForm({ id_tipo_usuario: e.target.value, id_facultad: '', id_carrera: '', id_ciclo: '' }); setErrors({}); }}
                        style={fieldStyle(errors.id_tipo_usuario)}
                    >
                        <option value="">Selecciona una opción</option>
                        {catalogos.tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                    {errors.id_tipo_usuario && <small role="alert" style={{ display: 'block', marginTop: '6px', color: '#ef4444', fontSize: '12px' }}>{errors.id_tipo_usuario}</small>}
                </label>

                {esEstudiante && (
                    <>
                        <label style={{ display: 'block', marginBottom: '18px' }}>
                            <span style={labelStyle}>Facultad</span>
                            <select
                                value={form.id_facultad}
                                aria-invalid={!!errors.id_facultad}
                                onChange={(e) => { setForm({ ...form, id_facultad: e.target.value, id_carrera: '' }); setErrors({ ...errors, id_facultad: undefined }); }}
                                style={fieldStyle(errors.id_facultad)}
                            >
                                <option value="">Selecciona tu facultad</option>
                                {facultadesConCarreras.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                            </select>
                            {errors.id_facultad && <small role="alert" style={{ display: 'block', marginTop: '6px', color: '#ef4444', fontSize: '12px' }}>{errors.id_facultad}</small>}
                        </label>

                        <label style={{ display: 'block', marginBottom: '18px' }}>
                            <span style={labelStyle}>Carrera</span>
                            <select
                                value={form.id_carrera}
                                disabled={!form.id_facultad}
                                aria-invalid={!!errors.id_carrera}
                                onChange={(e) => { setForm({ ...form, id_carrera: e.target.value }); setErrors({ ...errors, id_carrera: undefined }); }}
                                style={{ ...fieldStyle(errors.id_carrera), opacity: form.id_facultad ? 1 : 0.6 }}
                            >
                                <option value="">{form.id_facultad ? 'Selecciona tu carrera' : 'Primero elige la facultad'}</option>
                                {carrerasDeFacultad.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                            {errors.id_carrera && <small role="alert" style={{ display: 'block', marginTop: '6px', color: '#ef4444', fontSize: '12px' }}>{errors.id_carrera}</small>}
                        </label>

                        <label style={{ display: 'block', marginBottom: '18px' }}>
                            <span style={labelStyle}>Ciclo / semestre actual</span>
                            <select
                                value={form.id_ciclo}
                                aria-invalid={!!errors.id_ciclo}
                                onChange={(e) => { setForm({ ...form, id_ciclo: e.target.value }); setErrors({ ...errors, id_ciclo: undefined }); }}
                                style={fieldStyle(errors.id_ciclo)}
                            >
                                <option value="">Selecciona tu ciclo</option>
                                {catalogos.ciclos.map(c => <option key={c.id} value={c.id}>{/^\d+$/.test(String(c.numero)) ? `Ciclo ${c.numero}` : c.numero}</option>)}
                            </select>
                            {errors.id_ciclo && <small role="alert" style={{ display: 'block', marginTop: '6px', color: '#ef4444', fontSize: '12px' }}>{errors.id_ciclo}</small>}
                        </label>
                    </>
                )}

                {errors.general && <p role="alert" style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 12px' }}>{errors.general}</p>}

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!completo || saving}
                    style={{
                        width: '100%', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '15px',
                        background: completo && !saving ? 'var(--primary, #1d4ed8)' : '#e5e7eb',
                        color: completo && !saving ? '#fff' : '#6b7280',
                        cursor: completo && !saving ? 'pointer' : 'not-allowed'
                    }}
                >
                    {saving ? 'Guardando...' : 'Confirmar'}
                </button>
            </div>
        </div>
    );
};

export default TipoUsuarioModal;
