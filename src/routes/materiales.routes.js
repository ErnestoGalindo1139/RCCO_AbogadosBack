import { Router } from 'express';
import { verificarFolioMateriales } from '../controllers/materiales.controller.js';

const router = Router();

router.post('/verificar-folio-materiales', verificarFolioMateriales);

export default router;
