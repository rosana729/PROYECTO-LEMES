import { PrismaClient } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

const prisma = new PrismaClient();

export const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token de la sesión
    const sessionToken = req.session?.user?.token_sesion || req.cookies?.sessionToken;

    if (!sessionToken) {
      throw new UnauthorizedError('Token de sesión no encontrado');
    }

    // Buscar la sesión en la BD
    const session = await prisma.sesion.findUnique({
      where: { token_sesion: sessionToken },
      include: { usuario: true },
    });

    if (!session) {
      throw new UnauthorizedError('Sesión inválida o expirada');
    }

    // Verificar que la sesión no haya expirado
    if (new Date() > new Date(session.fecha_expiracion)) {
      // Marcar como inactiva
      await prisma.sesion.update({
        where: { id: session.id },
        data: { activa: false, fecha_cierre: new Date() },
      });
      throw new UnauthorizedError('La sesión ha expirado');
    }

    // Verificar que la sesión esté activa
    if (!session.activa) {
      throw new UnauthorizedError('La sesión ha sido cerrada');
    }

    // Verificar que el usuario esté activo
    if (session.usuario.estado !== 'activo') {
      throw new UnauthorizedError('El usuario no está activo');
    }

    // Guardar info del usuario en req
    req.user = session.usuario;
    req.sessionId = session.id;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en autenticación',
    });
  }
};

export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Usuario no autenticado');
      }

      if (!allowedRoles.includes(req.user.rol)) {
        throw new ForbiddenError(
          `Acceso denegado. Rol requerido: ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      const statusCode = error instanceof ForbiddenError ? 403 : 401;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  };
};

export const errorHandler = (err, req, res, next) => {
  console.error('Error handler caught:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default {
  authMiddleware,
  roleMiddleware,
  errorHandler,
};
