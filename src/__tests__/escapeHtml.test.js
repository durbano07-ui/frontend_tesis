import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../utils/escapeHtml';

// OWASP ASVS V5.3.3 — codificación de salida en las plantillas de impresión
describe('escapeHtml', () => {
    it('neutraliza etiquetas y atributos con código', () => {
        expect(escapeHtml('<img src=x onerror=alert(1)>')).toBe('&lt;img src=x onerror=alert(1)&gt;');
        expect(escapeHtml('"><script>robar()</script>')).toBe('&quot;&gt;&lt;script&gt;robar()&lt;/script&gt;');
    });

    it('conserva el texto normal y los nombres con apóstrofo o tildes', () => {
        expect(escapeHtml('María José Pérez')).toBe('María José Pérez');
        expect(escapeHtml("O'Brien & Hijos")).toBe('O&#39;Brien &amp; Hijos');
    });

    it('trata nulos y números sin romper la plantilla', () => {
        expect(escapeHtml(null)).toBe('');
        expect(escapeHtml(undefined)).toBe('');
        expect(escapeHtml(0)).toBe('0');
        expect(escapeHtml(36.5)).toBe('36.5');
    });
});
