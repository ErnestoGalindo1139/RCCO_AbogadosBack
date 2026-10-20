import { Router, raw } from 'express';
import {
  verifyWhatsAppSignature,
  extractWhatsAppStatuses,
  saveWhatsAppStatuses,
} from '../services/whatsapp-webhook.service.js';
import 'dotenv/config';

const router = Router();

// Meta verifies ownership of the callback URL by requesting this challenge.
router.get('/webhooks/whatsapp', (req, res) => {
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!token) {
    return res.status(503).send('Webhook verification is not configured');
  }

  const challenge = req.query['hub.challenge'];
  if (
    req.query['hub.mode'] !== 'subscribe' ||
    req.query['hub.verify_token'] !== token ||
    typeof challenge !== 'string' ||
    !challenge
  ) {
    return res.sendStatus(403);
  }

  return res.status(200).type('text/plain').send(challenge);
});

// This router is mounted BEFORE express.json(): signatures require the exact bytes.
router.post(
  '/webhooks/whatsapp',
  raw({ type: 'application/json', limit: '1mb' }),
  async (req, res) => {
    const secret = process.env.WHATSAPP_APP_SECRET;
    if (!secret)
      return res
        .status(503)
        .send('Webhook signature verification is not configured');
    if (
      !verifyWhatsAppSignature(req.body, req.get('x-hub-signature-256'), secret)
    )
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
      // Non-200 allows Meta to retry instead of losing the delivery event.
      console.error('No fue posible guardar el estado de entrega de WhatsApp');
      return res.sendStatus(500);
    }
  }
);

export default router;
