import express from 'express';
import whatsappService from '../services/whatsappService.js';

const router = express.Router();

/**
 * @swagger
 * /api/whatsapp/auth:
 *   get:
 *     summary: Genera un código QR para la autenticación de WhatsApp
 *     tags: [WhatsApp]
 *     responses:
 *       200:
 *         description: Código QR generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 qr:
 *                   type: string
 *                   description: Código QR en formato base64
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
router.get('/auth', async (req, res) => {
	try {
		const qrCode = await whatsappService.requestAuthentication();
		if (!qrCode) {
			return res.status(408).json({
				status: 'error',
				message: 'Timeout al generar el código QR'
			});
		}

		res.json({
			status: 'success',
			qr: qrCode
		});
	} catch (error) {
		res.status(500).json({
			status: 'error',
			message: error.message
		});
	}
});

/**
 * @swagger
 * /api/whatsapp/status:
 *   get:
 *     summary: Verifica el estado de la conexión de WhatsApp
 *     tags: [WhatsApp]
 *     responses:
 *       200:
 *         description: Estado de la conexión
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 connected:
 *                   type: boolean
 *                   description: Estado de la conexión
 */
router.get('/status', (req, res) => {
	res.json({
		status: 'success',
		connected: whatsappService.isReady
	});
});

export default router;