import { PrismaClient } from '@prisma/client';
import {
  hashPassword,
  comparePassword,
  generateSessionToken,
  calculateSessionExpiry,
} from '../utils/auth.js';
import { validateEmail, sanitizeEmail } from '../utils/validators.js';
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
} from '../utils/errors.js';

const prisma = new PrismaClient();

export const loginUser = async ({ email, password, ipAddress = null, browserInfo = null }) => {
  // Validaciones
  if (!email || !password) {
    throw new ValidationError('Email y contraseña son requeridos');
  }

  const cleanEmail = sanitizeEmail(email);
  if (!validateEmail(cleanEmail)) {
    throw new ValidationError('Email inválido', 'email');
  }

  // Buscar usuario
  const usuario = await prisma.usuario.findUnique({
    where: { email: cleanEmail },
  });

  if (!usuario) {
    throw new UnauthorizedError('Email o contraseña incorrectos');
  }

  // Verificar estado
  if (usuario.estado !== 'activo') {
    throw new UnauthorizedError('El usuario no está activo');
  }

  // Verificar contraseña
  const passwordMatch = await comparePassword(password, usuario.password_hash);
  if (!passwordMatch) {
    throw new UnauthorizedError('Email o contraseña incorrectos');
  }

  // Crear sesión
  const tokenSesion = generateSessionToken();
  const fechaExpiracion = calculateSessionExpiry(24); // 24 horas

  const sesion = await prisma.sesion.create({
    data: {
      usuario_id: usuario.id,
      token_sesion: tokenSesion,
      fecha_expiracion: fechaExpiracion,
      ip_address: ipAddress,
      navegador_info: browserInfo,
      activa: true,
    },
  });

  return {
    usuario: {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
    },
    sesion: {
      id: sesion.id,
      token: tokenSesion,
      expiresAt: fechaExpiracion,
    },
  };
};

export const logoutUser = async (sessionId) => {
  if (!sessionId) {
    throw new ValidationError('Session ID requerido');
  }

  const sesion = await prisma.sesion.update({
    where: { id: sessionId },
    data: {
      activa: false,
      fecha_cierre: new Date(),
    },
  });

  return sesion;
};

export const validateSession = async (tokenSesion) => {
  if (!tokenSesion) {
    throw new UnauthorizedError('Token de sesión no proporcionado');
  }

  const sesion = await prisma.sesion.findUnique({
    where: { token_sesion: tokenSesion },
    include: { usuario: true },
  });

  if (!sesion) {
    throw new NotFoundError('Sesión no encontrada');
  }

  if (!sesion.activa) {
    throw new UnauthorizedError('La sesión no está activa');
  }

  if (new Date() > new Date(sesion.fecha_expiracion)) {
    await prisma.sesion.update({
      where: { id: sesion.id },
      data: { activa: false, fecha_cierre: new Date() },
    });
    throw new UnauthorizedError('La sesión ha expirado');
  }

  return {
    usuario: sesion.usuario,
    sesion,
  };
};

export default {
  loginUser,
  logoutUser,
  validateSession,
};
