import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import qrcodeterm from 'qrcode-terminal';
import logger from '../utils/logger.js';

class WhatsAppService {
	constructor() {
		this.client = null;
		this.isReady = false;
		this.initializationAttempts = 0;
		this.maxInitializationAttempts = 8;
		this.reconnectDelay = 5000;
		this.reconnectBackoff = 1.5;
		this.maxReconnectDelay = 60000;
		this.browserInstance = null;
		this.activeConversations = new Set();
		this.qrCallbacks = new Set();
		this.autoReconnect = false;
		this.qrPromiseResolve = null;
		this.qrPromiseReject = null;
	}

	async initializeClient(forceInit = false) {
		try {
			if (!forceInit && this.client) {
				logger.info('Cliente ya inicializado');
				return;
			}
			if (this.initializationAttempts >= this.maxInitializationAttempts) {
				logger.error('Se alcanzó el número máximo de intentos de inicialización');
				// Resetear los intentos después de un período largo de espera
				setTimeout(() => {
					this.initializationAttempts = 0;
					logger.info('Reiniciando contador de intentos de inicialización');
					this.initializeClient();
				}, 300000); // 5 minutos de espera antes de reiniciar
				return;
			}

			// Calcular el tiempo de espera con backoff exponencial
			const currentDelay = Math.min(
				this.reconnectDelay * Math.pow(this.reconnectBackoff, this.initializationAttempts - 1),
				this.maxReconnectDelay
			);
			logger.info(`Intento ${this.initializationAttempts}/${this.maxInitializationAttempts} con delay de ${currentDelay / 1000} segundos`);

			this.initializationAttempts++;
			if (this.client) {
				try {
					logger.info('Destruyendo cliente anterior...');
					await this.client.destroy();
					// Esperar a que se liberen los recursos y el puerto
					await new Promise(resolve => setTimeout(resolve, 10000));
				} catch (error) {
					logger.warn('Error al destruir el cliente anterior:', error);
					// Forzar un tiempo de espera adicional en caso de error
					await new Promise(resolve => setTimeout(resolve, 15000));
					// Intentar forzar la liberación de recursos
					this.client = null;
					global.gc && global.gc();
				}
			}

			// Verificar el estado del sistema antes de crear una nueva instancia
			const initialMemory = process.memoryUsage();
			if (initialMemory.heapUsed > 1024 * 1024 * 256) { // Reducido a 256MB para ser más preventivo
				logger.warn('Alto uso de memoria detectado, esperando antes de reiniciar...');
				await new Promise(resolve => setTimeout(resolve, 15000));
				global.gc && global.gc(); // Forzar recolección de basura si está disponible
			}

			this.client = new Client({
				authStrategy: new LocalAuth(),
				puppeteer: {
					args: [
						'--no-sandbox',
						'--disable-setuid-sandbox',
						'--disable-dev-shm-usage',
						'--disable-accelerated-2d-canvas',
						'--disable-gpu',
						'--disable-extensions',
						'--disable-component-extensions-with-background-pages',
						'--disable-background-timer-throttling',
						'--disable-backgrounding-occluded-windows',
						'--disable-renderer-backgrounding',
						'--no-zygote',
						'--no-first-run',
						'--window-size=1280,720',
						'--user-data-dir=./puppeteer_data',
						'--disable-features=site-per-process',
						'--disable-web-security',
						'--disable-features=IsolateOrigins',
						'--disable-site-isolation-trials',
						'--disable-blink-features=AutomationControlled',
						'--disable-features=TranslateUI',
						'--disable-popup-blocking',
						'--disable-notifications',
						'--disable-infobars'
					],
					headless: true,
					ignoreHTTPSErrors: true,
					defaultViewport: null,
					timeout: 120000,
					protocolTimeout: 120000,
					handleSIGINT: true,
					handleSIGTERM: true,
					handleSIGHUP: true,
					connectionTimeout: 120000,
					pipeline: false,
					devtools: false,
					slowMo: 50,
					puppeteerOptions: {
						protocolTimeout: 120000
					}
				}
			});

			// Configurar un manejador para errores de protocolo a nivel de cliente
			this.client.pupBrowser?.on('disconnected', async () => {
				logger.warn('Navegador desconectado');
				this.isReady = false;

				// Limpiar recursos de manera más agresiva
				try {
					if (this.client) {
						await this.client.destroy().catch(e => logger.warn('Error al destruir cliente:', e));
					}
					// Forzar liberación de memoria
					global.gc && global.gc();
					await new Promise(resolve => setTimeout(resolve, 2000));
					global.gc && global.gc();
				} catch (error) {
					logger.error('Error al limpiar recursos:', error);
				}

				this.client = null;

				if (this.autoReconnect) {
					logger.info('Reiniciando cliente automáticamente...');
					// Aumentar el tiempo de espera antes de reconectar
					await new Promise(resolve => setTimeout(resolve, 10000));
					// Verificar el estado del sistema antes de reconectar
					const memoryUsage = process.memoryUsage();
					if (memoryUsage.heapUsed > 1024 * 1024 * 200) {
						logger.warn('Alto uso de memoria detectado antes de reconectar');
						await new Promise(resolve => setTimeout(resolve, 5000));
						global.gc && global.gc();
					}
					await this.initializeClient();
				}
			});

			this.client.on('qr', async (qr) => {
				logger.info('QR Code generado');
				qrcodeterm.generate(qr, { small: true });

				if (this.qrPromiseResolve && typeof this.qrPromiseResolve === 'function') {
					try {
						const qrBase64 = await qrcode.toDataURL(qr);
						this.qrPromiseResolve(qrBase64);
					} catch (error) {
						logger.error('Error al generar QR en base64:', error);
						if (this.qrPromiseReject && typeof this.qrPromiseReject === 'function') {
							this.qrPromiseReject(error);
						}
					}
				} else {
					logger.warn('No hay una función de resolución de promesa QR configurada');
				}
				// Limpiar las referencias después de resolver o rechazar
				this.qrPromiseResolve = null;
				this.qrPromiseReject = null;
			});

			this.client.on('ready', () => {
				this.isReady = true;
				logger.info('Cliente de WhatsApp listo y conectado');
			});

			this.client.on('authenticated', () => {
				logger.info('Cliente autenticado exitosamente');
			});

			this.client.on('auth_failure', (msg) => {
				logger.error('Error de autenticación:', msg);
			});

			this.client.on('disconnected', async (reason) => {
				logger.warn('Cliente desconectado:', reason);
				this.isReady = false;
				this.client = null;
				if (this.autoReconnect && this.initializationAttempts < this.maxInitializationAttempts) {
					logger.info(`Reintentando conexión en ${this.reconnectDelay / 1000} segundos...`);
					setTimeout(() => this.initializeClient(), this.reconnectDelay);
				} else {
					logger.info('Esperando solicitud manual de reconexión');
				}
			});

			this.client.on('message', async (message) => {
				try {
					logger.info(`Mensaje recibido de ${message.from}: ${message.body}`);
					await this.handleIncomingMessage(message);
				} catch (error) {
					logger.error('Error al procesar mensaje:', error);
				}
			});

			logger.info('Iniciando inicialización del cliente...');
			const initPromise = this.client.initialize();
			// Establecer un timeout para la inicialización con tiempo extendido
			const timeoutPromise = new Promise((_, reject) => {
				setTimeout(() => reject(new Error('Timeout durante la inicialización del cliente')), 300000); // 5 minutos
			});

			// Configurar manejador de errores a nivel de página con reintentos más robustos
			this.client.pupPage?.on('error', async (error) => {
				logger.error('Error en la página:', error);
				if (error.message.includes('Protocol error') || error.message.includes('Target closed')) {
					logger.warn('Error de protocolo detectado, iniciando proceso de recuperación...');
					await new Promise(resolve => setTimeout(resolve, 30000)); // Aumentar tiempo de espera
					if (this.client) {
						await this.client.destroy().catch(e => logger.warn('Error al destruir cliente:', e));
					}
					this.client = null;
					global.gc && global.gc();
					await new Promise(resolve => setTimeout(resolve, 5000));
					await this.initializeClient();
				}
			});

			// Configurar manejador de errores de conexión con limpieza de recursos
			this.client.pupPage?.on('close', async () => {
				logger.warn('Página cerrada inesperadamente');
				if (!this.isReady) {
					logger.info('Iniciando proceso de recuperación por cierre de página...');
					if (this.client) {
						await this.client.destroy().catch(e => logger.warn('Error al destruir cliente:', e));
					}
					this.client = null;
					global.gc && global.gc();
					await new Promise(resolve => setTimeout(resolve, 30000));
					await this.initializeClient();
				}
			});

			// Configurar manejador de errores de red con reintentos y limpieza
			this.client.pupPage?.on('requestfailed', async (request) => {
				const failure = request.failure();
				if (failure && (failure.errorText.includes('net::') || failure.errorText.includes('Protocol error'))) {
					logger.error('Error de red detectado:', failure.errorText);
					if (!this.isReady) {
						logger.warn('Iniciando proceso de recuperación por error de red...');
						if (this.client) {
							await this.client.destroy().catch(e => logger.warn('Error al destruir cliente:', e));
						}
						this.client = null;
						global.gc && global.gc();
						await new Promise(resolve => setTimeout(resolve, 30000));
						await this.initializeClient();
					}
				}
			});

			// Agregar manejador de errores para el navegador con limpieza de recursos
			this.client.on('browser_close', async () => {
				logger.warn('Navegador cerrado inesperadamente');
				this.isReady = false;
				// Limpiar recursos de manera más agresiva
				if (this.client) {
					await this.client.destroy().catch(e => logger.warn('Error al destruir cliente:', e));
				}
				this.client = null;
				global.gc && global.gc();
				await new Promise(resolve => setTimeout(resolve, 5000));
				global.gc && global.gc();
				if (this.autoReconnect) {
					await new Promise(resolve => setTimeout(resolve, 30000));
					await this.initializeClient();
				}
			});

			// Configurar manejador de errores de protocolo con limpieza de recursos
			this.client.on('protocol_error', async (error) => {
				logger.error('Error de protocolo detectado:', error);
				if (!this.isReady) {
					logger.warn('Iniciando proceso de recuperación por error de protocolo...');
					if (this.client) {
						await this.client.destroy().catch(e => logger.warn('Error al destruir cliente:', e));
					}
					this.client = null;
					global.gc && global.gc();
					await new Promise(resolve => setTimeout(resolve, 30000));
					await this.initializeClient();
				}
			});

			try {
				await Promise.race([initPromise, timeoutPromise]);
				logger.info('Inicialización del cliente completada exitosamente');
				// Resetear los intentos de inicialización si fue exitoso
				this.initializationAttempts = 0;
			} catch (initError) {
				logger.error('Error durante la inicialización:', initError);
				// Verificar si es un error de protocolo
				if (initError.message.includes('Protocol error') || initError.message.includes('Target closed')) {
					logger.warn('Error de protocolo detectado durante la inicialización, esperando antes de reintentar...');
					await new Promise(resolve => setTimeout(resolve, 30000)); // Aumentar tiempo de espera a 30 segundos
					// Forzar limpieza de recursos de manera más agresiva
					if (this.client) {
						await this.client.destroy().catch(e => logger.warn('Error al destruir cliente:', e));
					}
					this.client = null;
					// Forzar múltiples ciclos de recolección de basura
					global.gc && global.gc();
					await new Promise(resolve => setTimeout(resolve, 5000));
					global.gc && global.gc();
				}
				throw initError;
			}
		} catch (error) {
			logger.error('Error al inicializar el cliente:', error);
			this.isReady = false;
			if (this.autoReconnect) {
				setTimeout(() => this.initializeClient(), this.reconnectDelay);
			}
		}
	}

	async handleIncomingMessage(message) {
		// Procesamiento de mensajes
		logger.info(`Procesando mensaje: ${message.body}`);

		// Verificar si es la primera vez que recibimos un mensaje de este número
		// if (!this.activeConversations.has(message.from)) {
		// 	// Agregar el número a las conversaciones activas
		// 	this.activeConversations.add(message.from);

		// 	// Enviar mensaje de bienvenida
		// 	const welcomeMessage = "Hola te estas comunicando con el asistente de Glidpa IA";
		// 	try {
		// 		await this.sendMessage(message.from, welcomeMessage);
		// 		logger.info(`Mensaje de bienvenida enviado a ${message.from}`);
		// 	} catch (error) {
		// 		logger.error(`Error al enviar mensaje de bienvenida a ${message.from}:`, error);
		// 	}
		// }

		// Importar el controlador del bot para procesar el mensaje con la IA de Gemini
		try {
			// Importación dinámica para evitar dependencias circulares
			const { default: botController } = await import('../controllers/botController.js');
			await botController.handleMessage(message);
		} catch (error) {
			logger.error(`Error al procesar mensaje con el controlador del bot: ${error.message}`);
		}
	}

	async sendMessage(to, message) {
		let retryCount = 0;
		const maxRetries = 3;
		let lastError = null;

		while (retryCount <= maxRetries) {
			try {
				// Verificar si el cliente está listo
				if (!this.client || !this.isReady) {
					logger.warn(`Cliente no está listo (intento ${retryCount + 1}/${maxRetries + 1}), intentando reinicializar...`);
					await this.initializeClient();

					// Esperar hasta que el cliente esté listo o se alcance el máximo de intentos
					let attempts = 0;
					const maxAttempts = 15;
					const waitTime = 2000; // 2 segundos entre intentos
					while (!this.isReady && attempts < maxAttempts) {
						await new Promise(resolve => setTimeout(resolve, waitTime));
						attempts++;
						logger.info(`Intento ${attempts}/${maxAttempts} de espera por cliente listo...`);
						if (!this.client) {
							logger.warn('Cliente perdido durante la espera, reinicializando...');
							await this.initializeClient();
						}
					}

					if (!this.isReady) {
						if (retryCount < maxRetries) {
							retryCount++;
							const waitTime = 5000 * Math.pow(2, retryCount);
							logger.warn(`Cliente no listo, reintentando en ${waitTime / 1000} segundos (intento ${retryCount}/${maxRetries})`);
							await new Promise(resolve => setTimeout(resolve, waitTime));
							continue;
						} else {
							throw new Error('El cliente de WhatsApp no está listo después de múltiples reintentos');
						}
					}
				}

				// Intentar enviar el mensaje
				const response = await this.client.sendMessage(to, message);
				logger.info(`Mensaje enviado exitosamente a ${to}`);
				return response;

			} catch (error) {
				lastError = error;
				logger.error(`Error al enviar mensaje a ${to} (intento ${retryCount + 1}/${maxRetries + 1}):`, error);

				// Manejar errores específicos de protocolo
				if (error.message.includes('Protocol error') ||
					error.message.includes('Target closed') ||
					error.message.includes('Session closed') ||
					error.message.includes('Connection closed')) {

					logger.warn(`Detectado error de protocolo: ${error.message}, reinicializando cliente...`);
					this.isReady = false;

					// Intentar destruir el cliente de forma segura
					try {
						if (this.client) {
							await this.client.destroy().catch(e => logger.warn('Error al destruir cliente:', e));
						}
					} catch (destroyError) {
						logger.warn('Error al destruir cliente:', destroyError);
					}

					this.client = null;
					global.gc && global.gc(); // Forzar recolección de basura si está disponible

					// Reinicializar con backoff exponencial
					if (retryCount < maxRetries) {
						retryCount++;
						const waitTime = 5000 * Math.pow(2, retryCount);
						logger.warn(`Reintentando en ${waitTime / 1000} segundos (intento ${retryCount}/${maxRetries})`);
						await new Promise(resolve => setTimeout(resolve, waitTime));
						await this.initializeClient();
						continue;
					}
				}

				// Para otros tipos de errores, reintentamos menos veces
				if (retryCount < maxRetries) {
					retryCount++;
					const waitTime = 3000 * retryCount;
					logger.warn(`Reintentando envío en ${waitTime / 1000} segundos (intento ${retryCount}/${maxRetries})`);
					await new Promise(resolve => setTimeout(resolve, waitTime));
					continue;
				}

				// Si llegamos aquí, hemos agotado los reintentos
				break;
			}
		}

		// Si llegamos aquí, todos los intentos fallaron
		logger.error(`Todos los intentos de envío a ${to} fallaron después de ${maxRetries + 1} intentos`);
		throw lastError || new Error(`Fallo al enviar mensaje a ${to} después de múltiples intentos`);
	}

	getClient() {
		return this.client;
	}

	async requestAuthentication() {
		try {
			this.autoReconnect = false;

			// Si ya hay una solicitud de QR en curso, esperar a que se complete
			if (this.qrPromiseResolve) {
				logger.warn('Ya hay una solicitud de QR en curso');
				return null;
			}

			// Si el cliente está autenticado, no generar QR
			if (this.isReady) {
				logger.info('Cliente ya autenticado');
				return null;
			}

			// Reiniciar el cliente para forzar la generación de un nuevo QR
			await this.initializeClient(true);

			// Crear una nueva promesa y guardar sus funciones resolve/reject
			let qrResolve, qrReject;
			const qrPromise = new Promise((resolve, reject) => {
				qrResolve = resolve;
				qrReject = reject;
			});

			// Guardar las referencias a las funciones resolve/reject
			this.qrPromiseResolve = qrResolve;
			this.qrPromiseReject = qrReject;

			// Definir los callbacks antes de registrarlos
			const qrCallback = async (qr) => {
				try {
					logger.info('QR Code recibido en requestAuthentication');
					// Convertir el QR a base64 para enviarlo al frontend
					// const qrBase64 = await qrcode.toDataURL(qr);
					logger.info('QR Code convertido a base64 exitosamente');

					// Verificar que la promesa aún no ha sido resuelta
					if (this.qrPromiseResolve) {
						// Resolver la promesa con el código QR en base64
						this.qrPromiseResolve(qr);
						// Limpiar las referencias
						this.qrPromiseResolve = null;
						this.qrPromiseReject = null;
						// Eliminar los listeners para evitar duplicados
						this.client.removeListener('qr', qrCallback);
						this.client.removeListener('authenticated', authCallback);
					}
				} catch (error) {
					logger.error('Error al generar QR en base64:', error);
					// Verificar que la promesa aún no ha sido rechazada
					if (this.qrPromiseReject) {
						this.qrPromiseReject(error);
						// Limpiar las referencias
						this.qrPromiseResolve = null;
						this.qrPromiseReject = null;
						// Eliminar los listeners
						this.client.removeListener('qr', qrCallback);
						this.client.removeListener('authenticated', authCallback);
					}
				}
			};

			const authCallback = () => {
				logger.info('Autenticación exitosa en requestAuthentication');
				// Verificar que la promesa aún no ha sido resuelta
				if (this.qrPromiseResolve) {
					this.qrPromiseResolve(null);
					// Limpiar las referencias
					this.qrPromiseResolve = null;
					this.qrPromiseReject = null;
					// Eliminar los listeners
					this.client.removeListener('qr', qrCallback);
					this.client.removeListener('authenticated', authCallback);
				}
			};

			// Registrar los callbacks para los eventos
			this.client.on('qr', qrCallback);
			this.client.on('authenticated', authCallback);

			// Timeout después de 60 segundos
			const timeoutId = setTimeout(() => {
				logger.warn('Timeout en requestAuthentication');
				// Verificar que la promesa aún no ha sido resuelta
				if (this.qrPromiseResolve) {
					this.qrPromiseResolve(null);
					// Limpiar las referencias
					this.qrPromiseResolve = null;
					this.qrPromiseReject = null;
					// Eliminar los listeners
					this.client.removeListener('qr', qrCallback);
					this.client.removeListener('authenticated', authCallback);
				}
			}, 60000);

			// Limpiar timeout si se resuelve antes
			this.client.once('ready', () => {
				clearTimeout(timeoutId);
			});

			// Devolver la promesa
			return qrPromise;
		} catch (error) {
			logger.error('Error al solicitar autenticación:', error);
			return null;
		}
	}
}

const whatsappService = new WhatsAppService();
export default whatsappService;