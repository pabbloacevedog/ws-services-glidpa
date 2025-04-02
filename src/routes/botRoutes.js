import express from 'express';
import botController from '../controllers/botController.js';

const router = express.Router();

/**
 * @swagger
 * /api/bot/webhook:
 *   post:
 *     summary: Recibe y procesa mensajes de WhatsApp
 *     tags: [Bot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from:
 *                 type: string
 *                 description: Número de teléfono del remitente
 *               body:
 *                 type: string
 *                 description: Contenido del mensaje
 *     responses:
 *       200:
 *         description: Mensaje procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 */

// Ruta para recibir mensajes de WhatsApp
router.post('/webhook', async (req, res) => {
	try {
		const message = req.body;
		await botController.handleMessage(message);
		res.status(200).json({ status: 'success' });
	} catch (error) {
		console.error('Error en webhook:', error);
		res.status(500).json({ status: 'error', message: error.message });
	}
});

/**
 * @swagger
 * /api/bot/status:
 *   get:
 *     summary: Verifica el estado del servicio de WhatsApp Bot
 *     tags: [Bot]
 *     responses:
 *       200:
 *         description: Estado del servicio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: active
 *                 service:
 *                   type: string
 *                   example: WhatsApp Bot
 */
router.get('/status', (req, res) => {
	const service = botController.getWhatsAppService();
	res.json({ status: 'active', service: 'WhatsApp Bot' });
});

export default router;