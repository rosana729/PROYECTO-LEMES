import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';
import {
  crearTurno,
  obtenerTurno,
  turnosPorPaciente,
  turnosPorFecha,
  proximoTurno,
  cambiarEstado,
  iniciarConsulta,
  finalizarConsulta,
  actualizarTurno,
  estadisticas,
} from '../controllers/turnosController.js';

const router = express.Router();

// Todas requieren autenticación
router.use(authMiddleware);

// Crear turno (Secretaria, Admin)
router.post('/', roleMiddleware('ROLE_SECRETARIA', 'ROLE_ADMIN'), crearTurno);

// Estadísticas
router.get('/estadisticas', roleMiddleware('ROLE_ADMIN', 'ROLE_DOCTOR'), estadisticas);

// Próximo turno (Doctor)
router.get('/proximo', roleMiddleware('ROLE_DOCTOR'), proximoTurno);

// Turnos por fecha
router.get('/fecha', turnosPorFecha);

// Turnos por paciente
router.get('/paciente/:paciente_id', turnosPorPaciente);

// Obtener uno
router.get('/:id', obtenerTurno);

// Actualizar
router.put('/:id', roleMiddleware('ROLE_SECRETARIA', 'ROLE_ADMIN', 'ROLE_DOCTOR'), actualizarTurno);

// Cambiar estado
router.patch('/:id/estado', roleMiddleware('ROLE_SECRETARIA', 'ROLE_ADMIN'), cambiarEstado);

// Iniciar consulta
router.patch('/:id/iniciar', roleMiddleware('ROLE_DOCTOR'), iniciarConsulta);

// Finalizar consulta
router.patch('/:id/finalizar', roleMiddleware('ROLE_DOCTOR'), finalizarConsulta);

export default router;
