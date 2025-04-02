import whatsappService from '../services/whatsappService.js';
import aiService from '../services/aiService.js';
import logger from '../utils/logger.js';

class BotController {
	constructor() {
		this.whatsappService = whatsappService;
	}

	async handleMessage(message) {
		try {
			// Aquí implementaremos la lógica de procesamiento de mensajes
			const response = await this.processMessage(message);
			if (response) {
				await this.whatsappService.sendMessage(message.from, response);
			}
		} catch (error) {
			logger.error('Error en el controlador del bot:', error);
			throw error;
		}
	}

	async processMessage(message) {
		try {
			// Utilizamos el servicio de IA para generar una respuesta
			const userId = message.from; // Usamos el número de teléfono como identificador único
			const userMessage = message.body;
			
			// Generamos la respuesta utilizando Google Gemini
			const response = await aiService.generateResponse(userId, userMessage);
			return response;
		} catch (error) {
			logger.error('Error al procesar mensaje con IA:', error);
			return 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde.';
		}
	}

	getWhatsAppService() {
		return this.whatsappService;
	}
}

const botController = new BotController();
export default botController;