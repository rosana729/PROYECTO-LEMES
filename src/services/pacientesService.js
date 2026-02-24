import { PrismaClient } from '@prisma/client';
import { validateDNI } from '../utils/validators.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

const prisma = new PrismaClient();

export const createPaciente = async (data) => {
  // Validaciones básicas
  if (!data.dni) {
    throw new ValidationError('DNI es requerido', 'dni');
  }

  if (!validateDNI(data.dni)) {
    throw new ValidationError('DNI inválido', 'dni');
  }

  // Verificar si el DNI ya existe
  const dniExists = await prisma.paciente.findUnique({
    where: { dni: data.dni },
  });

  if (dniExists) {
    throw new ValidationError('El DNI ya está registrado', 'dni');
  }

  const paciente = await prisma.paciente.create({
    data: {
      usuario_id: data.usuario_id,
      dni: data.dni.replace(/\D/g, ''),
      nombre: data.nombre || '',
      apellido: data.apellido || '',
      fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : null,
      sexo: data.sexo || null,
      peso: data.peso ? parseFloat(data.peso) : null,
      talla: data.talla ? parseFloat(data.talla) : null,
      grupo_sanguineo: data.grupo_sanguineo || null,
      telefono: data.telefono || null,
      direccion: data.direccion || null,
      ciudad: data.ciudad || null,
    },
  });

  return paciente;
};

export const getPacienteByDNI = async (dni) => {
  const paciente = await prisma.paciente.findUnique({
    where: { dni: dni.replace(/\D/g, '') },
    include: {
      historias_clinicas: {
        orderBy: { fecha: 'desc' },
        take: 5,
      },
      turnos: {
        orderBy: { fecha_hora: 'desc' },
        take: 5,
      },
    },
  });

  if (!paciente) {
    throw new NotFoundError('Paciente no encontrado');
  }

  return paciente;
};

export const getPacienteById = async (id) => {
  const paciente = await prisma.paciente.findUnique({
    where: { id },
    include: {
      usuario: {
        select: { email: true, rol: true },
      },
      historias_clinicas: {
        orderBy: { fecha: 'desc' },
      },
      turnos: {
        orderBy: { fecha_hora: 'desc' },
      },
      citas: {
        orderBy: { fecha_hora: 'desc' },
      },
      documentos: {
        orderBy: { fecha_carga: 'desc' },
      },
    },
  });

  if (!paciente) {
    throw new NotFoundError('Paciente no encontrado');
  }

  return paciente;
};

export const getAllPacientes = async (limit = 50, offset = 0) => {
  const pacientes = await prisma.paciente.findMany({
    skip: offset,
    take: limit,
    orderBy: { fecha_creacion: 'desc' },
    include: {
      usuario: {
        select: { email: true },
      },
    },
  });

  const total = await prisma.paciente.count();

  return {
    data: pacientes,
    total,
    limit,
    offset,
  };
};

export const updatePaciente = async (id, data) => {
  const paciente = await prisma.paciente.update({
    where: { id },
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : undefined,
      sexo: data.sexo,
      peso: data.peso ? parseFloat(data.peso) : undefined,
      talla: data.talla ? parseFloat(data.talla) : undefined,
      grupo_sanguineo: data.grupo_sanguineo,
      telefono: data.telefono,
      direccion: data.direccion,
      ciudad: data.ciudad,
      estado: data.estado,
    },
  });

  return paciente;
};

export const searchPacientes = async (query, limit = 20) => {
  const pacientes = await prisma.paciente.findMany({
    where: {
      OR: [
        { dni: { contains: query } },
        { nombre: { contains: query, mode: 'insensitive' } },
        { apellido: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: limit,
    select: {
      id: true,
      dni: true,
      nombre: true,
      apellido: true,
      fecha_nacimiento: true,
      telefono: true,
    },
  });

  return pacientes;
};

export default {
  createPaciente,
  getPacienteByDNI,
  getPacienteById,
  getAllPacientes,
  updatePaciente,
  searchPacientes,
};
