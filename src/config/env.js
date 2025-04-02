// Variables de entorno
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde el archivo .env
const envPath = join(dirname(dirname(__dirname)), '.env');

if (fs.existsSync(envPath)) {
	dotenv.config({ path: envPath });
} else {
	console.warn('Archivo .env no encontrado, usando variables de entorno del sistema');
	dotenv.config();
}

// Exportar variables de entorno
export const PORT = process.env.PORT || 3000;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-preview-02-05:generateContent';
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite-preview-02-05';
// Validar variables críticas
if (!GEMINI_API_KEY) {
	throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno');
}