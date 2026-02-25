import { PrismaClient } from '@prisma/client';
import { isValidTurnoStatus } from '../utils/validators.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

let prisma = null;
const getPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};

export const createTurno = async (data) => {
  // Validaciones
  if (!data.paciente_id) {
    throw new ValidationError('Paciente ID es requerido', 'paciente_id');
  }

  if (!data.fecha_hora) {
    throw new ValidationError('Fecha y hora son requeridos', 'fecha_hora');
  }

  // Verificar que el paciente existe
  const paciente = await getPrisma().paciente.findUnique({
    where: { id: data.paciente_id },
  });

  if (!paciente) {
    throw new NotFoundError('Paciente no encontrado');
  }

  const turno = await getPrisma().turno.create({
    data: {
      paciente_id: data.paciente_id,
      medico_id: data.medico_id || null,
      fecha_hora: new Date(data.fecha_hora),
      estado: 'pendiente',
      motivo: data.motivo || null,
      notas: data.notas || null,
    },
    include: {
      paciente: {
        select: { nombre: true, apellido: true, dni: true },
      },
      medico: {
        select: { nombre: true, apellido: true },
      },
    },
  });

  return turno;
};

export const getTurnoById = async (id) => {
  const turno = await getPrisma().turno.findUnique({
    where: { id },
    include: {
      paciente: true,
      medico: {
        select: { id: true, nombre: true, apellido: true, email: true },
      },
    },
  });

  if (!turno) {
    throw new NotFoundError('Turno no encontrado');
  }

  return turno;
};

export const getTurnosByPaciente = async (paciente_id) => {
  const turnos = await getPrisma().turno.findMany({
    where: { paciente_id },
    orderBy: { fecha_hora: 'desc' },
    include: {
      medico: {
        select: { nombre: true, apellido: true },
      },
    },
  });

  return turnos;
};

export const getTurnosByDate = async (fecha) => {
  const startOfDay = new Date(fecha);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(fecha);
  endOfDay.setHours(23, 59, 59, 999);

  const turnos = await getPrisma().turno.findMany({
    where: {
      fecha_hora: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { fecha_hora: 'asc' },
    include: {
      paciente: {
        select: { nombre: true, apellido: true, dni: true },
      },
      medico: {
        select: { nombre: true, apellido: true },
      },
    },
  });

  return turnos;
};

export const getNextTurno = async (fecha = null) => {
  const date = fecha ? new Date(fecha) : new Date();
  date.setHours(0, 0, 0, 0);

  const turno = await getPrisma().turno.findFirst({
    where: {
      fecha_hora: { gte: date },
      estado: {
        in: ['pendiente', 'confirmado'],
      },
    },
    orderBy: { fecha_hora: 'asc' },
    include: {
      paciente: true,
      medico: {
        select: { nombre: true, apellido: true },
      },
    },
  });

  if (!turno) {
    throw new NotFoundError('No hay turnos pendientes para hoy');
  }

  return turno;
};

export const updateTurnoStatus = async (id, nuevoEstado) => {
  if (!isValidTurnoStatus(nuevoEstado)) {
    throw new ValidationError('Estado de turno inválido', 'estado');
  }

  const turno = await getPrisma().turno.update({
    where: { id },
    data: { estado: nuevoEstado },
    include: {
      paciente: {
        select: { nombre: true, apellido: true },
      },
      medico: {
        select: { nombre: true, apellido: true },
      },
    },
  });

  return turno;
};

export const updateTurno = async (id, data) => {
  const updateData = {};

  if (data.estado && isValidTurnoStatus(data.estado)) {
    updateData.estado = data.estado;
  }

  if (data.motivo !== undefined) {
    updateData.motivo = data.motivo;
  }

  if (data.notas !== undefined) {
    updateData.notas = data.notas;
  }

  if (data.medico_id !== undefined) {
    updateData.medico_id = data.medico_id;
  }

  if (data.fecha_hora) {
    updateData.fecha_hora = new Date(data.fecha_hora);
  }

  const turno = await getPrisma().turno.update({
    where: { id },
    data: updateData,
    include: {
      paciente: {
        select: { nombre: true, apellido: true, dni: true },
      },
      medico: {
        select: { nombre: true, apellido: true },
      },
    },
  });

  return turno;
};

export const getTurnosStats = async (fecha = null) => {
  const date = fecha ? new Date(fecha) : new Date();
  date.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const totalHoy = await getPrisma().turno.count({
    where: {
      fecha_hora: {
        gte: date,
        lte: endOfDay,
      },
    },
  });

  const atendidos = await getPrisma().turno.count({
    where: {
      fecha_hora: {
        gte: date,
        lte: endOfDay,
      },
      estado: 'atendido',
    },
  });

  const cancelados = await getPrisma().turno.count({
    where: {
      fecha_hora: {
        gte: date,
        lte: endOfDay,
      },
      estado: 'cancelado',
    },
  });

  return {
    totalHoy,
    atendidos,
    cancelados,
    pendientes: totalHoy - atendidos - cancelados,
  };
};

export default {
  createTurno,
  getTurnoById,
  getTurnosByPaciente,
  getTurnosByDate,
  getNextTurno,
  updateTurnoStatus,
  updateTurno,
  getTurnosStats,
};
