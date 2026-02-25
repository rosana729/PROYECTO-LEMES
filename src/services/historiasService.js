import { PrismaClient } from '@prisma/client';
import { calculateIMC } from '../utils/validators.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

let prisma = null;
const getPrisma = () => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};

export const createHistoriaClinica = async (data) => {
  // Validaciones
  if (!data.paciente_id) {
    throw new ValidationError('Paciente ID es requerido', 'paciente_id');
  }

  // Verificar que el paciente existe
  const paciente = await getPrisma().paciente.findUnique({
    where: { id: data.paciente_id },
  });

  if (!paciente) {
    throw new NotFoundError('Paciente no encontrado');
  }

  // Calcular IMC si se proporcionan peso y talla
  let imc = null;
  if (data.peso && data.talla) {
    imc = calculateIMC(data.peso, data.talla);
  }

  const historia = await getPrisma().historiaClinica.create({
    data: {
      paciente_id: data.paciente_id,
      fecha: data.fecha ? new Date(data.fecha) : new Date(),
      diagnostico: data.diagnostico || null,
      peso: data.peso ? parseFloat(data.peso) : null,
      talla: data.talla ? parseFloat(data.talla) : null,
      imc,
      presion_arterial: data.presion_arterial || null,
      frecuencia_cardiaca: data.frecuencia_cardiaca ? parseInt(data.frecuencia_cardiaca) : null,
      temperatura: data.temperatura ? parseFloat(data.temperatura) : null,
      saturacion_oxigeno: data.saturacion_oxigeno ? parseFloat(data.saturacion_oxigeno) : null,
      medicamentos: data.medicamentos || null,
      observaciones: data.observaciones || null,
    },
    include: {
      paciente: {
        select: { nombre: true, apellido: true, dni: true },
      },
    },
  });

  return historia;
};

export const getHistoriaClinicaById = async (id) => {
  const historia = await getPrisma().historiaClinica.findUnique({
    where: { id },
    include: {
      paciente: {
        select: { nombre: true, apellido: true, dni: true, fecha_nacimiento: true },
      },
      estudios_adjuntos: {
        orderBy: { fecha_carga: 'desc' },
      },
    },
  });

  if (!historia) {
    throw new NotFoundError('Historia clínica no encontrada');
  }

  return historia;
};

export const getHistoriasClinicasByPaciente = async (paciente_id, limit = 20) => {
  const historias = await getPrisma().historiaClinica.findMany({
    where: { paciente_id },
    orderBy: { fecha: 'desc' },
    take: limit,
    include: {
      estudios_adjuntos: {
        take: 3,
        orderBy: { fecha_carga: 'desc' },
      },
    },
  });

  return historias;
};

export const updateHistoriaClinica = async (id, data) => {
  const updateData = {};

  if (data.diagnostico !== undefined) {
    updateData.diagnostico = data.diagnostico;
  }

  if (data.peso !== undefined || data.talla !== undefined) {
    const historia = await getPrisma().historiaClinica.findUnique({ where: { id } });

    const peso = data.peso !== undefined ? parseFloat(data.peso) : historia.peso;
    const talla = data.talla !== undefined ? parseFloat(data.talla) : historia.talla;

    if (peso && talla) {
      updateData.imc = calculateIMC(peso, talla);
    }

    if (data.peso !== undefined) updateData.peso = peso;
    if (data.talla !== undefined) updateData.talla = talla;
  }

  if (data.presion_arterial !== undefined) {
    updateData.presion_arterial = data.presion_arterial;
  }

  if (data.frecuencia_cardiaca !== undefined) {
    updateData.frecuencia_cardiaca = data.frecuencia_cardiaca ? parseInt(data.frecuencia_cardiaca) : null;
  }

  if (data.temperatura !== undefined) {
    updateData.temperatura = data.temperatura ? parseFloat(data.temperatura) : null;
  }

  if (data.saturacion_oxigeno !== undefined) {
    updateData.saturacion_oxigeno = data.saturacion_oxigeno ? parseFloat(data.saturacion_oxigeno) : null;
  }

  if (data.medicamentos !== undefined) {
    updateData.medicamentos = data.medicamentos;
  }

  if (data.observaciones !== undefined) {
    updateData.observaciones = data.observaciones;
  }

  const historia = await getPrisma().historiaClinica.update({
    where: { id },
    data: updateData,
    include: {
      paciente: {
        select: { nombre: true, apellido: true, dni: true },
      },
    },
  });

  return historia;
};

export const getUltimaHistoriaClinica = async (paciente_id) => {
  const historia = await getPrisma().historiaClinica.findFirst({
    where: { paciente_id },
    orderBy: { fecha: 'desc' },
    include: {
      paciente: {
        select: { nombre: true, apellido: true, dni: true },
      },
      estudios_adjuntos: {
        orderBy: { fecha_carga: 'desc' },
      },
    },
  });

  return historia;
};

export default {
  createHistoriaClinica,
  getHistoriaClinicaById,
  getHistoriasClinicasByPaciente,
  updateHistoriaClinica,
  getUltimaHistoriaClinica,
};
