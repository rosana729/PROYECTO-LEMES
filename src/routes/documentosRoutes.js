import express from 'express';
import multer from 'multer';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';
import {
  subirDocumento,
  obtenerDocumento,
  documentosPaciente,
  eliminarDocumento,
} from '../controllers/documentosController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Todas requieren autenticación
router.use(authMiddleware);

// Subir documento (Secretaria, Admin)
router.post('/:paciente_id', roleMiddleware('ROLE_SECRETARIA', 'ROLE_ADMIN'), upload.single('archivo'), subirDocumento);

// Documentos de un paciente
router.get('/paciente/:paciente_id', documentosPaciente);

// Obtener documento
router.get('/:id', obtenerDocumento);

// Eliminar
router.delete('/:id', roleMiddleware('ROLE_SECRETARIA', 'ROLE_ADMIN'), eliminarDocumento);

export default router;
