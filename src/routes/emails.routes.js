import { Router } from 'express';
import { enviarCorreoPagoEvento } from '../controllers/emails.controller.js';

const router = Router();

router.post('/enviarCorreoPagoEvento', enviarCorreoPagoEvento);

export default router;
