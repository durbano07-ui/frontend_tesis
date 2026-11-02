import { headerBienestar } from '../assets/headerBienestarBase64.js';
import { escapeHtml } from './escapeHtml';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** "2 de noviembre del 2026" (fecha de emisión del certificado). */
export const fechaEmisionTexto = (fecha = new Date()) =>
    `${fecha.getDate()} de ${MESES[fecha.getMonth()]} del ${fecha.getFullYear()}`;

/** 'AAAA-MM-DD…' → 'DD/MM/AAAA' */
export const fechaCorta = (valor) => valor ? String(valor).slice(0, 10).split('-').reverse().join('/') : '—';

/**
 * Certificado con el diseño oficial de Bienestar Universitario (el mismo del certificado
 * odontológico): banner institucional, título centrado, cuerpo justificado, fecha y firma.
 * `parrafos` son fragmentos HTML ya escapados por quien los arma.
 */
export const certificadoHtml = ({ tituloPestana, titulo, parrafos, firmaNombre, firmaCargo }) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(tituloPestana || titulo)}</title>
    <style>
        @page { size: A4 portrait; margin: 22mm 24mm 22mm 24mm; }
        body {
            font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #000000;
            margin: 0; padding: 20px; background-color: #f1f5f9;
            display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; box-sizing: border-box;
        }
        .page-sheet {
            background-color: #ffffff; width: 210mm; min-height: 297mm; padding: 22mm 24mm;
            box-sizing: border-box; box-shadow: 0 4px 15px rgba(0,0,0,0.1); position: relative;
        }
        .header-banner { width: 100%; text-align: center; margin-bottom: 25px; }
        .header-banner img { width: 100%; max-width: 660px; height: auto; display: block; margin: 0 auto; }
        .cert-title {
            text-align: center; font-size: 13pt; font-weight: bold; letter-spacing: 0.5px; color: #000;
            margin: 35px 0 30px 0; text-transform: uppercase;
        }
        .cert-body p { margin: 0 0 25px 0; text-align: justify; font-size: 11pt; line-height: 1.85; color: #000; }
        .cert-date { text-align: center; font-size: 11pt; color: #000; margin: 45px 0 60px 0; }
        .signature-section { text-align: center; margin-top: 50px; }
        .signature-line { width: 250px; border-top: 1px solid #000; margin: 0 auto 8px auto; }
        .signature-name { font-size: 11pt; font-weight: bold; color: #000; }
        .signature-role { font-size: 10pt; color: #333; }
        @media print {
            body { background: transparent; padding: 0; margin: 0; }
            .page-sheet { box-shadow: none; padding: 0; margin: 0; width: 100%; min-height: auto; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
    </style>
</head>
<body>
    <div class="page-sheet">
        <div class="header-banner">
            <img src="${headerBienestar}" alt="UEB | Bienestar Universitario" />
        </div>

        <div class="cert-title">${escapeHtml(titulo)}</div>

        <div class="cert-body">
            ${parrafos.map(p => `<p>${p}</p>`).join('\n            ')}
        </div>

        <div class="cert-date">Guaranda, ${escapeHtml(fechaEmisionTexto())}</div>

        <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-name">${escapeHtml(firmaNombre)}</div>
            <div class="signature-role">${escapeHtml(firmaCargo)}</div>
        </div>
    </div>

    <script>
        window.onload = function() { window.print(); };
    </script>
</body>
</html>`;
