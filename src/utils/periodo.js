// Período de consulta de los reportes: un día o un mes de un año.

export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const hoyIso = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Por defecto: el mes actual. */
export const periodoInicial = () => {
    const d = new Date();
    return { tipo: 'mes', dia: hoyIso(), mes: d.getMonth() + 1, anio: d.getFullYear() };
};

/** ¿La fecha ('YYYY-MM-DD…') cae en el período? Sin fecha no se incluye. */
export const enPeriodo = (fecha, periodo) => {
    const f = String(fecha || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) return false;
    if (periodo.tipo === 'dia') return f === periodo.dia;
    return f.slice(0, 7) === `${periodo.anio}-${String(periodo.mes).padStart(2, '0')}`;
};

/** "el 25/10/2026" o "en octubre de 2026" */
export const describirPeriodo = (periodo) => {
    if (periodo.tipo === 'dia') {
        const [y, m, d] = String(periodo.dia).split('-');
        return `el ${d}/${m}/${y}`;
    }
    return `en ${MESES[periodo.mes - 1].toLowerCase()} de ${periodo.anio}`;
};
