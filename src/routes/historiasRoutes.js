import express from 'express';
import multer from 'multer';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';
import {
  crearHistoria,
  obtenerHistoria,
  obtenerHistoriasPaciente,
  obtenerUltimaHistoria,
  actualizarHistoria,
  subirEstudio,
} from '../controllers/historiasController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Todas requieren autenticación
router.use(authMiddleware);

// Crear historia (Doctor)
router.post('/', roleMiddleware('ROLE_DOCTOR'), crearHistoria);

// Obtener historias de un paciente
router.get('/paciente/:paciente_id', obtenerHistoriasPaciente);

// Obtener última historia
router.get('/paciente/:paciente_id/ultima', obtenerUltimaHistoria);

// Obtener una historia
router.get('/:id', obtenerHistoria);

// Actualizar historia (Doctor)
router.put('/:id', roleMiddleware('ROLE_DOCTOR'), actualizarHistoria);

// Subir estudio/adjunto (Doctor)
router.post('/:historia_id/estudios', roleMiddleware('ROLE_DOCTOR'), upload.single('archivo'), subirEstudio);

export default router;
