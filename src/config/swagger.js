import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
	openapi: '3.0.0',
	info: {
		title: 'API de WhatsApp Bot',
		version: '1.0.0',
		description: 'API para interactuar con el servicio de WhatsApp Bot',
	},
	servers: [
		{
			url: 'http://localhost:3000',
			description: 'Servidor de desarrollo',
		},
	],
};

const options = {
	swaggerDefinition,
	apis: ['./src/routes/*.js'], // Rutas donde buscar anotaciones de Swagger
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;