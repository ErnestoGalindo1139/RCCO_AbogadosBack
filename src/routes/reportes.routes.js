// routes/reportes.routes.js
import { Router } from 'express';
import { generarExcelUsuarios } from '../controllers/reportes.controller.js';

const router = Router();

router.post('/registrosSimposio/EXCEL', generarExcelUsuarios);

export default router;
