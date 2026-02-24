import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';
import {
  registrarPaciente,
  buscarPacientePorDNI,
  obtenerPaciente,
  listarPacientes,
  actualizarPaciente,
  buscar,
} from '../controllers/pacientesController.js';

const router = express.Router();

// Todas requieren autenticación
router.use(authMiddleware);

// Registrar paciente (Secretaria, Admin)
router.post('/', roleMiddleware('ROLE_SECRETARIA', 'ROLE_ADMIN'), registrarPaciente);

// Buscar por DNI
router.get('/buscar-dni', buscarPacientePorDNI);

// Búsqueda general
router.get('/buscar', buscar);

// Listar todos
router.get('/', listarPacientes);

// Obtener uno
router.get('/:id', obtenerPaciente);

// Actualizar
router.put('/:id', roleMiddleware('ROLE_SECRETARIA', 'ROLE_ADMIN'), actualizarPaciente);

export default router;
