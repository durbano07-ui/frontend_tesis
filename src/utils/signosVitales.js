/**
 * Rangos admisibles de los signos vitales (los mismos de Medicina Ocupacional). Evitan registrar
 * valores imposibles como 1200 °C; el control es solo del frontend.
 */
export const RANGOS_SIGNOS = {
    presion_arterial_sistolica: { nombre: 'la PA sistólica', min: 60, max: 250 },
    presion_arterial_diastolica: { nombre: 'la PA diastólica', min: 30, max: 150 },
    frecuencia_cardiaca: { nombre: 'la frecuencia cardiaca', min: 30, max: 220 },
    frecuencia_respiratoria: { nombre: 'la frecuencia respiratoria', min: 8, max: 60 },
    temperatura: { nombre: 'la temperatura', min: 34, max: 43 },
    talla: { nombre: 'la talla', min: 50, max: 250 },
    peso: { nombre: 'el peso', min: 2, max: 300 },
    spo2: { nombre: 'la saturación SpO2', min: 50, max: 100 },
};

const vacio = (v) => !String(v ?? '').trim();

/**
 * Valores fuera de rango: { campo: mensaje }. Solo revisa los campos presentes en `valores` y no
 * marca los vacíos (quien llama decide si son obligatorios).
 */
export const erroresRangoSignos = (valores) => {
    const e = {};
    Object.entries(RANGOS_SIGNOS).forEach(([campo, { min, max }]) => {
        if (!(campo in valores) || vacio(valores[campo])) return;
        const n = Number(String(valores[campo]).replace(',', '.'));
        if (!(n >= min && n <= max)) e[campo] = `Valor fuera de rango (${min} a ${max}).`;
    });
    const { presion_arterial_sistolica: sis, presion_arterial_diastolica: dia } = valores;
    if (!e.presion_arterial_sistolica && !e.presion_arterial_diastolica && !vacio(sis) && !vacio(dia) && Number(dia) >= Number(sis)) {
        e.presion_arterial_diastolica = 'Debe ser menor que la PA sistólica.';
    }
    return e;
};

/**
 * Filtro para el onChange: rechaza lo que ya no puede ser válido mientras se escribe (negativos,
 * más del máximo o más de un decimal). Lo que queda por debajo del mínimo (p. ej. "3" camino de
 * "36.5") se deja escribir y se marca al salir del campo o al continuar.
 */
export const valorSignoPermitido = (campo, valor) => {
    const texto = String(valor ?? '').trim().replace(',', '.');
    if (!texto) return true;
    const rango = RANGOS_SIGNOS[campo];
    if (!rango || !/^\d*\.?\d?$/.test(texto)) return false;
    return Number(texto) <= rango.max;
};
