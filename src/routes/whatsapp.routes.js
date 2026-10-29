import { Router, raw } from 'express';
import {
  verifyWhatsAppSignature,
  extractWhatsAppStatuses,
  saveWhatsAppStatuses,
} from '../services/whatsapp-webhook.service.js';
import 'dotenv/config';

const router = Router();
// Mounted before express.json(): signatures require the exact request bytes.
router.post(
  '/webhooks/whatsapp',
  raw({ type: 'application/json', limit: '1mb' }),
  async (req, res) => {
    const secret = process.env.YCLOUD_WEBHOOK_SECRET;
    if (!secret)
      return res
        .status(503)
        .send('Webhook signature verification is not configured');
    if (!verifyWhatsAppSignature(req.body, req.get('YCloud-Signature'), secret))
      return res.sendStatus(401);
    let payload;
    try {
      payload = JSON.parse(req.body.toString('utf8'));
    } catch {
      return res.sendStatus(400);
    }
    try {
      await saveWhatsAppStatuses(extractWhatsAppStatuses(payload));
      return res.sendStatus(200);
    } catch {
      console.error('No fue posible guardar el estado de entrega de WhatsApp');
      return res.sendStatus(500);
    }
  }
);
export default router;
