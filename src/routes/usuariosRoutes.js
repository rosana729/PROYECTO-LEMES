import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';
import {
  crearUsuario,
  obtenerUsuario,
  listarUsuarios,
  actualizarUsuario,
  eliminarUsuario,
  cambiarContrasena,
} from '../controllers/usuariosController.js';

const router = express.Router();

// Todas requieren autenticación
router.use(authMiddleware);

// Cambiar contraseña (cualquier usuario autenticado)
router.post('/cambiar-contrasena', cambiarContrasena);

// CRUD de usuarios (solo Admin)
router.use(roleMiddleware('ROLE_ADMIN'));

router.post('/', crearUsuario);
router.get('/', listarUsuarios);
router.get('/:id', obtenerUsuario);
router.put('/:id', actualizarUsuario);
router.delete('/:id', eliminarUsuario);

export default router;
