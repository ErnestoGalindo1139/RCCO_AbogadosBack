import { Router } from 'express';
import { actualizarPagoUsuarioEvento, createUsuariosEvento, getUsuariosEvento } from '../controllers/usuariosEvento.controller.js';

const router = Router();

router.get('/usuariosEvento', getUsuariosEvento);

router.post('/createUsuariosEvento', createUsuariosEvento);

router.post('/updatePagoUsuariosEvento', actualizarPagoUsuarioEvento);

export default router;
