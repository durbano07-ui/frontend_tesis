/**
 * Genera las huellas SHA-256 de los scripts en línea de las plantillas de impresión
 * para la Content-Security-Policy (OWASP ASVS V14.4.3).
 *
 * Las fichas, recetas y certificados se imprimen en ventanas/iframes que heredan la CSP
 * de la aplicación y usan pequeños scripts fijos (window.print / window.close). En lugar de
 * permitir cualquier script en línea ('unsafe-inline'), se autorizan solo esos textos exactos.
 * Se calcula sobre el bundle ya compilado para que las huellas siempre coincidan.
 *
 * Uso: node scripts/generate-csp-hashes.mjs <carpeta dist> <archivo de salida nginx>
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [distDir = 'dist', outFile = 'csp-hashes.conf'] = process.argv.slice(2);
const assetsDir = join(distDir, 'assets');

const sha256 = (text) => `'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`;

const scripts = new Set();
const handlers = new Set();

for (const file of readdirSync(assetsDir).filter((f) => f.endsWith('.js'))) {
    const code = readFileSync(join(assetsDir, file), 'utf8');
    // El minificador escribe </script> como <\/script>
    for (const m of code.matchAll(/<script>([\s\S]*?)<\\?\/script>/g)) scripts.add(m[1]);
    for (const m of code.matchAll(/\bon(?:click|load)="(window\.(?:print|close)\(\))"/g)) handlers.add(m[1]);
}

const hashes = [...scripts, ...handlers].map(sha256);
writeFileSync(outFile, `# Generado por scripts/generate-csp-hashes.mjs — no editar\nset $csp_script_hashes "${hashes.join(' ')}";\n`);
console.log(`CSP: ${scripts.size} scripts y ${handlers.size} manejadores autorizados por hash -> ${outFile}`);
