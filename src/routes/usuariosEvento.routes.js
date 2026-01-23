import { Router } from 'express';
import {
  getUsuariosEvento,
  createUsuariosEvento,
  actualizarPagoUsuarioEvento,
  updateUsuarioEvento,
  toggleUsuarioEvento,
  verificarUsuariosEvento,
} from '../controllers/usuariosEvento.controller.js';

const router = Router();

// ===============================
// LISTAR USUARIOS EVENTO
// ===============================
router.get('/usuariosEvento', getUsuariosEvento);

// ===============================
// CREAR USUARIO EVENTO
// ===============================
router.post('/createUsuariosEvento', createUsuariosEvento);

// ===============================
// ACTUALIZAR PAGO
// ===============================
router.post('/updatePagoUsuariosEvento', actualizarPagoUsuarioEvento);

// ===============================
// ✏️ EDITAR USUARIO EVENTO (MODAL)
// ===============================
router.post('/updateUsuarioEvento', updateUsuarioEvento);

// ===============================
// 🗑 ACTIVAR / DESACTIVAR USUARIO EVENTO (SOFT DELETE)
// ===============================
router.post('/toggleUsuarioEvento', toggleUsuarioEvento);

// ===============================
// 🔍 BUSCAR USUARIOS EVENTO (VERIFICADOR)
// ===============================
router.post('/usuariosEvento/buscar', verificarUsuariosEvento);

export default router;
