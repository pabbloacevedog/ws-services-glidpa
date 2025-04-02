import './src/config/env.js'; // Importar configuración de variables de entorno primero
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import botRoutes from './src/routes/botRoutes.js';
import whatsappAuthRoutes from './src/routes/whatsappAuthRoutes.js';
import logger from './src/utils/logger.js';
import swaggerSpec from './src/config/swagger.js';

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200);
	}
	next();
});

// Middleware para procesar JSON
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
	res.send('WhatsApp Bot Service');
});

// Documentación de Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Integración de las rutas del bot
app.use('/api/bot', botRoutes);

// Integración de las rutas de autenticación de WhatsApp
app.use('/api/whatsapp', whatsappAuthRoutes);

app.listen(port, () => {
	logger.info(`Servidor iniciado en el puerto ${port}`);
});