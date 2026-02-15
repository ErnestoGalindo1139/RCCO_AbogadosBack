import { Router } from 'express';
import {
  descargarCertificado,
  verificarFolioMateriales,
} from '../controllers/materiales.controller.js';

const router = Router();

router.post('/verificar-folio-materiales', verificarFolioMateriales);
router.get('/descargar-certificado/:id', descargarCertificado);

export default router;
