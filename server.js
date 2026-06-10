/**
 * Servidor Unificado para o Render
 * Este arquivo liga o motor Nitro (TanStack Start) diretamente
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// O Render tenta rodar este arquivo. Vamos apontar para o motor real.
const nitroEntry = path.join(__dirname, '.output', 'server', 'index.mjs');

if (fs.existsSync(nitroEntry)) {
    console.log('🚀 Ligando o motor Backs ZapCRM (Nitro)...');
    import(nitroEntry);
} else {
    console.error('❌ ERRO CRÍTICO: Motor do site não encontrado em .output/server/index.mjs');
    console.log('Certifique-se de que o comando "npm run build" foi executado corretamente.');
    process.exit(1);
}
