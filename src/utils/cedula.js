/**
 * Cédula ecuatoriana (persona natural) validada con el algoritmo del Registro Civil.
 * Misma regla que App\Support\CedulaEcuatoriana en el backend.
 */
export const esCedulaValida = (cedula) => {
    const c = String(cedula || '').trim();
    if (!/^\d{10}$/.test(c)) return false;

    const provincia = Number(c.slice(0, 2));
    if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) return false;
    if (Number(c[2]) >= 6) return false;

    let suma = 0;
    for (let i = 0; i < 9; i++) {
        let valor = Number(c[i]) * (i % 2 === 0 ? 2 : 1);
        if (valor > 9) valor -= 9;
        suma += valor;
    }
    return (10 - (suma % 10)) % 10 === Number(c[9]);
};

export const MENSAJE_CEDULA_INVALIDA = 'La cédula ingresada no es válida. Verifique los 10 dígitos.';
