import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import logger from '../utils/logger.js';
import { AI_SYSTEM_CONFIG } from '../config/ai_system_config.js';

class AIService {
	constructor() {
		this.apiKey = process.env.GEMINI_API_KEY;
		this.model = process.env.GEMINI_MODEL;
		this.genAI = null;
		this.conversationHistory = new Map(); // Almacena el historial de conversaciones por usuario
		this.initializeGemini();
	}

	initializeGemini() {
		try {
			if (!this.apiKey) {
				logger.error('GEMINI_API_KEY no está configurada en las variables de entorno');
				return;
			}

			// Inicializar el cliente de Google Generative AI con la API key
			this.genAI = new GoogleGenerativeAI(this.apiKey);

			// Verificar que la inicialización fue exitosa
			if (!this.genAI) {
				logger.error('Error: No se pudo inicializar el cliente de Google Gemini');
				return;
			}

			// Probar la conexión con un modelo básico para verificar que la API key es válida
			const testModel = this.genAI.getGenerativeModel({
				model: this.model,
			});

			if (testModel) {
				logger.info('Servicio de Google Gemini inicializado correctamente');
			} else {
				logger.error('Error: No se pudo obtener el modelo generativo');
			}
		} catch (error) {
			logger.error('Error al inicializar el servicio de Google Gemini:', error);
			this.genAI = null;
		}
	}

	/**
	 * Obtiene el historial de conversación para un usuario específico
	 * @param {string} userId - Identificador único del usuario
	 * @returns {Array} - Historial de conversación
	 */
	getUserConversationHistory(userId) {
		if (!this.conversationHistory.has(userId)) {
			this.conversationHistory.set(userId, []);
		}
		return this.conversationHistory.get(userId);
	}

	/**
	 * Añade un mensaje al historial de conversación
	 * @param {string} userId - Identificador único del usuario
	 * @param {string} role - Rol del mensaje ('user' o 'model')
	 * @param {string} content - Contenido del mensaje
	 */
	addMessageToHistory(userId, role, content, imageData = null) {
		const history = this.getUserConversationHistory(userId);
		const parts = [];

		if (typeof content === 'string') {
			parts.push({ text: content });
		}

		if (imageData) {
			parts.push({
				inlineData: {
					data: imageData,
					mimeType: 'image/jpeg' // Ajustar según el tipo de imagen
				}
			});
		}

		history.push({
			role,
			parts
		});

		// Limitar el historial a los últimos 10 mensajes para evitar tokens excesivos
		if (history.length > 10) {
			history.shift(); // Elimina el mensaje más antiguo
		}
	}

	/**
	 * Genera una respuesta utilizando la API de Google Gemini
	 * @param {string} userId - Identificador único del usuario
	 * @param {string} message - Mensaje del usuario
	 * @returns {Promise<string>} - Respuesta generada
	 */
	async generateResponse(userId, message) {
		try {
			// Verificar si el servicio está inicializado, si no, intentar inicializarlo nuevamente
			if (!this.genAI) {
				logger.warn('El servicio de Google Gemini no está inicializado, intentando reinicializar...');
				this.initializeGemini();

				// Si después de intentar inicializar sigue sin estar disponible
				if (!this.genAI) {
					logger.error('El servicio de Google Gemini no pudo ser inicializado');
					return 'Lo siento, el servicio de IA no está disponible en este momento.';
				}
			}

			// Configurar el modelo con parámetros de seguridad esenciales
			const model = this.genAI.getGenerativeModel({
				...AI_SYSTEM_CONFIG.modelConfig,
				systemInstruction: AI_SYSTEM_CONFIG.systemInstruction,
				safetySettings: AI_SYSTEM_CONFIG.safetySettings || [
					{
						category: HarmCategory.HARM_CATEGORY_HARASSMENT,
						threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
					},
					{
						category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
						threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
					},
					{
						category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
						threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
					},
					{
						category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
						threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
					},
				]
			});

			// Generar respuesta directamente usando generateContent
			const result = await model.generateContent(message);
			const response = result.response.text();

			logger.info(`Respuesta generada para ${userId}: ${response.substring(0, 100)}...`);
			return response;
		} catch (error) {
			logger.error('Error al generar respuesta con Google Gemini:', error);
			return 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.';
		}
	}

	/**
	 * Limpia el historial de conversación para un usuario específico
	 * @param {string} userId - Identificador único del usuario
	 */
	clearConversationHistory(userId) {
		this.conversationHistory.delete(userId);
		logger.info(`Historial de conversación eliminado para el usuario ${userId}`);
	}
}

const aiService = new AIService();
export default aiService;