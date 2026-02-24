import {
  createUsuario,
  getUsuarioById,
  getAllUsuarios,
  getUsuariosByRol,
  updateUsuario,
  deleteUsuario,
  changePassword,
} from '../services/usuariosService.js';
import { handleError } from '../utils/errors.js';

export const crearUsuario = async (req, res) => {
  try {
    const { email, password, nombre, apellido, rol } = req.body;

    const usuario = await createUsuario({
      email,
      password,
      nombre,
      apellido,
      rol,
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      usuario,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await getUsuarioById(id);

    res.json({
      success: true,
      usuario,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const listarUsuarios = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    if (req.query.rol) {
      const usuarios = await getUsuariosByRol(req.query.rol, limit);
      return res.json({
        success: true,
        data: usuarios,
        total: usuarios.length,
      });
    }

    const result = await getAllUsuarios(limit, offset);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, nombre, apellido, rol, estado } = req.body;

    const usuario = await updateUsuario(id, {
      email,
      nombre,
      apellido,
      rol,
      estado,
    });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      usuario,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Evitar eliminar al usuario actual
    if (id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta',
      });
    }

    const usuario = await deleteUsuario(id);

    res.json({
      success: true,
      message: 'Usuario eliminado',
      usuario,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const cambiarContrasena = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    await changePassword(req.user.id, old_password, new_password);

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente',
    });
  } catch (error) {
    handleError(error, res);
  }
};

export default {
  crearUsuario,
  obtenerUsuario,
  listarUsuarios,
  actualizarUsuario,
  eliminarUsuario,
  cambiarContrasena,
};
