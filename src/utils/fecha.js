/**
 * Fecha para mostrar en reportes: "25/10/2026".
 * La API envía las fechas de las citas como fecha y hora en UTC ("2026-10-25T05:00:00.000000Z",
 * medianoche de Ecuador); se toma solo la parte de la fecha para no desfasar el día.
 */
export const formatFecha = (valor) => {
    if (valor === null || valor === undefined || valor === '') return '';
    const m = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : String(valor);
};
