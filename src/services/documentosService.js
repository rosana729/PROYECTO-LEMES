import { PrismaClient } from '@prisma/client';
import { initSupabase } from '../config/supabase.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

const prisma = new PrismaClient();

export const uploadDocumento = async (pacienteId, file, tipo_documento = 'documento') => {
  if (!pacienteId) {
    throw new ValidationError('Paciente ID es requerido', 'paciente_id');
  }

  if (!file) {
    throw new ValidationError('Archivo es requerido', 'file');
  }

  // Verificar que el paciente existe
  const paciente = await prisma.paciente.findUnique({
    where: { id: pacienteId },
  });

  if (!paciente) {
    throw new NotFoundError('Paciente no encontrado');
  }

  try {
    const supabase = initSupabase();
    const bucket = 'medical-documents';

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileName = `pacientes/${pacienteId}/${tipo_documento}/${timestamp}_${file.originalname}`;

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Error en Supabase: ${error.message}`);
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    // Guardar en base de datos
    const documento = await prisma.documento.create({
      data: {
        paciente_id: pacienteId,
        tipo_documento,
        nombre_archivo: file.originalname,
        url: publicUrl,
        url_supabase: fileName,
        tamaño: file.size,
        mime_type: file.mimetype,
      },
    });

    return documento;
  } catch (error) {
    console.error('Error al subir documento:', error);
    throw new Error(`Error al subir documento: ${error.message}`);
  }
};

export const uploadEstudioAdjunto = async (historiaClinicaId, file, tipoEstudio = 'documento') => {
  if (!historiaClinicaId) {
    throw new ValidationError('Historia Clínica ID es requerido', 'historia_clinica_id');
  }

  if (!file) {
    throw new ValidationError('Archivo es requerido', 'file');
  }

  // Verificar que la historia existe
  const historia = await prisma.historiaClinica.findUnique({
    where: { id: historiaClinicaId },
  });

  if (!historia) {
    throw new NotFoundError('Historia clínica no encontrada');
  }

  try {
    const supabase = initSupabase();
    const bucket = 'medical-documents';

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileName = `estudios/${historiaClinicaId}/${tipoEstudio}/${timestamp}_${file.originalname}`;

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Error en Supabase: ${error.message}`);
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    // Guardar en base de datos
    const estudio = await prisma.estudioAdjunto.create({
      data: {
        historia_clinica_id: historiaClinicaId,
        tipo_estudio: tipoEstudio,
        nombre_archivo: file.originalname,
        url: publicUrl,
        url_supabase: fileName,
        tamaño: file.size,
        mime_type: file.mimetype,
      },
    });

    return estudio;
  } catch (error) {
    console.error('Error al subir estudio:', error);
    throw new Error(`Error al subir estudio: ${error.message}`);
  }
};

export const getDocumentoById = async (id) => {
  const documento = await prisma.documento.findUnique({
    where: { id },
    include: {
      paciente: {
        select: { nombre: true, apellido: true },
      },
    },
  });

  if (!documento) {
    throw new NotFoundError('Documento no encontrado');
  }

  return documento;
};

export const getDocumentosByPaciente = async (pacienteId, limit = 50) => {
  const documentos = await prisma.documento.findMany({
    where: { paciente_id: pacienteId },
    orderBy: { fecha_carga: 'desc' },
    take: limit,
  });

  return documentos;
};

export const deleteDocumento = async (id) => {
  const documento = await prisma.documento.findUnique({
    where: { id },
  });

  if (!documento) {
    throw new NotFoundError('Documento no encontrado');
  }

  try {
    const supabase = initSupabase();

    // Eliminar archivo de Supabase Storage
    if (documento.url_supabase) {
      const { error } = await supabase.storage
        .from('medical-documents')
        .remove([documento.url_supabase]);

      if (error) {
        console.error('Error al eliminar archivo:', error);
      }
    }

    // Eliminar registro de BD
    await prisma.documento.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    throw new Error(`Error al eliminar documento: ${error.message}`);
  }
};

export default {
  uploadDocumento,
  uploadEstudioAdjunto,
  getDocumentoById,
  getDocumentosByPaciente,
  deleteDocumento,
};
