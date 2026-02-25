import { loginUser, logoutUser } from '../services/authService.js';
import { handleError } from '../utils/errors.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Obtener información del cliente
    const ipAddress = req.ip || req.connection.remoteAddress;
    const browserInfo = req.get('user-agent');

    const result = await loginUser({
      email,
      password,
      ipAddress,
      browserInfo,
    });

    // Guardar en sesión de Express (para desarrollo)
    req.session.user = {
      id: result.usuario.id,
      email: result.usuario.email,
      nombre: result.usuario.nombre,
      apellido: result.usuario.apellido,
      rol: result.usuario.rol,
      token_sesion: result.sesion.token,
    };

    // Crear JWT para Vercel (serverless)
    const token = jwt.sign(
      {
        id: result.usuario.id,
        email: result.usuario.email,
        nombre: result.usuario.nombre,
        apellido: result.usuario.apellido,
        rol: result.usuario.rol,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Guardar token en cookie HttpOnly
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      usuario: result.usuario,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const logout = async (req, res) => {
  try {
    // Marcar sesión como inactiva en BD
    if (req.sessionId) {
      try {
        await logoutUser(req.sessionId);
      } catch (dbError) {
        console.error('Error al actualizar sesión en BD:', dbError);
      }
    }

    // Destruir sesión de Express
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al destruir sesión:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al cerrar sesión',
        });
      }

      // Limpiar cookies
      res.clearCookie('sessionToken');
      res.clearCookie('connect.sid');

      res.json({
        success: true,
        message: 'Cierre de sesión exitoso',
      });
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const getCurrentUser = (req, res) => {
  try {
    res.json({
      success: true,
      usuario: {
        id: req.user.id,
        email: req.user.email,
        nombre: req.user.nombre,
        apellido: req.user.apellido,
        rol: req.user.rol,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
};

export default {
  login,
  logout,
  getCurrentUser,
};
