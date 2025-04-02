# Proyecto Bot WhatsApp

Este proyecto implementa un bot de WhatsApp utilizando Node.js y Express. La estructura del proyecto sigue una arquitectura modular para facilitar el mantenimiento y la escalabilidad.

## Estructura del Proyecto

```
bot-whatsapp/
│── src/
│   ├── config/
│   │   ├── database.js       # Configuración de la base de datos MySQL
│   │   ├── redis.js          # Configuración de Redis
│   │   ├── whatsapp.js       # Configuración de whatsapp-web.js
│   │   ├── env.js            # Variables de entorno
│   ├── models/
│   │   ├── User.js           # Modelo de usuario (ejemplo)
│   │   ├── Appointment.js    # Modelo de citas
│   ├── controllers/
│   │   ├── botController.js  # Controlador principal del bot
│   │   ├── chatController.js # Manejo de mensajes y respuestas
│   │   ├── appointmentController.js # Controlador de citas
│   ├── services/
│   │   ├── whatsappService.js # Servicio de conexión con WhatsApp
│   │   ├── aiService.js       # Integración con Google Gemini
│   │   ├── dbService.js       # Consultas a MySQL
│   │   ├── redisService.js    # Cache de respuestas en Redis
│   ├── routes/
│   │   ├── botRoutes.js       # Rutas relacionadas con el bot
│   ├── utils/
│   │   ├── logger.js          # Configuración de Winston para logs
│   ├── index.js               # Archivo principal del servidor
│── .env                       # Archivo de variables de entorno
│── package.json               # Archivo de configuración de npm
│── README.md                  # Documentación
```

## Instalación

1. Clona el repositorio.
2. Ejecuta `npm install` para instalar las dependencias.
3. Configura las variables de entorno en el archivo `.env`.

## Uso

Ejecuta `npm start` para iniciar el servidor.

## Contribución

Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la licencia ISC.