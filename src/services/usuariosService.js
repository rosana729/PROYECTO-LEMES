import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/auth.js';
import { validateEmail, sanitizeEmail, isValidRole } from '../utils/validators.js';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors.js';

let prisma = null;
const getPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};

export const createUsuario = async (data) => {
  // Validaciones
  if (!data.email) {
    throw new ValidationError('Email es requerido', 'email');
  }

  if (!data.password) {
    throw new ValidationError('Contraseña es requerida', 'password');
  }

  if (!data.nombre) {
    throw new ValidationError('Nombre es requerido', 'nombre');
  }

  if (!data.apellido) {
    throw new ValidationError('Apellido es requerido', 'apellido');
  }

  if (!data.rol || !isValidRole(data.rol)) {
    throw new ValidationError('Rol inválido', 'rol');
  }

  const cleanEmail = sanitizeEmail(data.email);

  if (!validateEmail(cleanEmail)) {
    throw new ValidationError('Email inválido', 'email');
  }

  // Verificar si el email ya existe
  const usuarioExistente = await getPrisma().usuario.findUnique({
    where: { email: cleanEmail },
  });

  if (usuarioExistente) {
    throw new ConflictError('El email ya está registrado', 'email');
  }

  // Hash de contraseña
  const passwordHash = await hashPassword(data.password);

  const usuario = await getPrisma().usuario.create({
    data: {
      email: cleanEmail,
      password_hash: passwordHash,
      nombre: data.nombre,
      apellido: data.apellido,
      rol: data.rol,
      estado: 'activo',
    },
  });

  // No devolver la contraseña
  return {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    rol: usuario.rol,
    estado: usuario.estado,
    fecha_creacion: usuario.fecha_creacion,
  };
};

export const getUsuarioById = async (id) => {
  const usuario = await getPrisma().usuario.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      rol: true,
      estado: true,
      fecha_creacion: true,
      fecha_actualizacion: true,
    },
  });

  if (!usuario) {
    throw new NotFoundError('Usuario no encontrado');
  }

  return usuario;
};

export const getAllUsuarios = async (limit = 50, offset = 0) => {
  const usuarios = await getPrisma().usuario.findMany({
    skip: offset,
    take: limit,
    orderBy: { fecha_creacion: 'desc' },
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      rol: true,
      estado: true,
      fecha_creacion: true,
    },
  });

  const total = await getPrisma().usuario.count();

  return {
    data: usuarios,
    total,
    limit,
    offset,
  };
};

export const getUsuariosByRol = async (rol, limit = 50) => {
  if (!isValidRole(rol)) {
    throw new ValidationError('Rol inválido', 'rol');
  }

  const usuarios = await getPrisma().usuario.findMany({
    where: { rol },
    take: limit,
    orderBy: { fecha_creacion: 'desc' },
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      rol: true,
      estado: true,
    },
  });

  return usuarios;
};

export const updateUsuario = async (id, data) => {
  const updateData = {};

  if (data.nombre) {
    updateData.nombre = data.nombre;
  }

  if (data.apellido) {
    updateData.apellido = data.apellido;
  }

  if (data.rol && isValidRole(data.rol)) {
    updateData.rol = data.rol;
  }

  if (data.estado) {
    updateData.estado = data.estado; // activo, inactivo
  }

  if (data.email) {
    const cleanEmail = sanitizeEmail(data.email);

    if (!validateEmail(cleanEmail)) {
      throw new ValidationError('Email inválido', 'email');
    }

    const usuarioExistente = await getPrisma().usuario.findUnique({
      where: { email: cleanEmail },
    });

    if (usuarioExistente && usuarioExistente.id !== id) {
      throw new ConflictError('El email ya está registrado', 'email');
    }

    updateData.email = cleanEmail;
  }

  const usuario = await getPrisma().usuario.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      rol: true,
      estado: true,
    },
  });

  return usuario;
};

export const deleteUsuario = async (id) => {
  const usuario = await getPrisma().usuario.delete({
    where: { id },
    select: {
      id: true,
      email: true,
    },
  });

  return usuario;
};

export const changePassword = async (id, oldPassword, newPassword) => {
  if (!oldPassword || !newPassword) {
    throw new ValidationError('Contraseñas requeridas');
  }

  const usuario = await getPrisma().usuario.findUnique({
    where: { id },
  });

  if (!usuario) {
    throw new NotFoundError('Usuario no encontrado');
  }

  // Verificar contraseña anterior
  const { comparePassword } = await import('../utils/auth.js');
  const passwordMatch = await comparePassword(oldPassword, usuario.password_hash);

  if (!passwordMatch) {
    throw new ValidationError('Contraseña anterior incorrecta', 'oldPassword');
  }

  const newPasswordHash = await hashPassword(newPassword);

  await getPrisma().usuario.update({
    where: { id },
    data: { password_hash: newPasswordHash },
  });

  return { success: true, message: 'Contraseña actualizada correctamente' };
};

export default {
  createUsuario,
  getUsuarioById,
  getAllUsuarios,
  getUsuariosByRol,
  updateUsuario,
  deleteUsuario,
  changePassword,
};
