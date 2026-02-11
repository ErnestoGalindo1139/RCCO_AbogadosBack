import { Router } from 'express';
import {
  getPreguntasEncuesta,
  getResultadosEncuestaDashboard,
  responderEncuesta,
} from '../controllers/encuesta.controller.js';

const router = Router();

router.get('/preguntasEncuesta', getPreguntasEncuesta);
router.post('/createEncuestaRespuesta', responderEncuesta);
router.get('/resultados-encuesta', getResultadosEncuestaDashboard);

export default router;
