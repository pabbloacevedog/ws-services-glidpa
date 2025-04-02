import { Sequelize } from 'sequelize';
import logger from '../utils/logger.js';

const sequelize = new Sequelize({
	host: process.env.DB_HOST || 'localhost',
	database: process.env.DB_NAME || 'whatsapp_bot',
	username: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	dialect: 'mysql',
	logging: (msg) => logger.debug(msg),
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	}
});

// Función para probar la conexión
async function testConnection() {
	try {
		await sequelize.authenticate();
		logger.info('Conexión a MySQL establecida correctamente.');
	} catch (error) {
		logger.error('Error al conectar con MySQL:', error);
	}
}

testConnection();

export default sequelize;