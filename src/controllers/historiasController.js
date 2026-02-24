import {
  createHistoriaClinica,
  getHistoriaClinicaById,
  getHistoriasClinicasByPaciente,
  updateHistoriaClinica,
  getUltimaHistoriaClinica,
} from '../services/historiasService.js';
import { uploadEstudioAdjunto } from '../services/documentosService.js';
import { handleError } from '../utils/errors.js';

export const crearHistoria = async (req, res) => {
  try {
    const {
      paciente_id,
      fecha,
      diagnostico,
      peso,
      talla,
      presion_arterial,
      frecuencia_cardiaca,
      temperatura,
      saturacion_oxigeno,
      medicamentos,
      observaciones,
    } = req.body;

    const historia = await createHistoriaClinica({
      paciente_id,
      fecha,
      diagnostico,
      peso,
      talla,
      presion_arterial,
      frecuencia_cardiaca,
      temperatura,
      saturacion_oxigeno,
      medicamentos,
      observaciones,
    });

    res.status(201).json({
      success: true,
      message: 'Historia clínica creada',
      historia,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const obtenerHistoria = async (req, res) => {
  try {
    const { id } = req.params;

    const historia = await getHistoriaClinicaById(id);

    res.json({
      success: true,
      historia,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const obtenerHistoriasPaciente = async (req, res) => {
  try {
    const { paciente_id } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const historias = await getHistoriasClinicasByPaciente(paciente_id, limit);

    res.json({
      success: true,
      historias,
      total: historias.length,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const obtenerUltimaHistoria = async (req, res) => {
  try {
    const { paciente_id } = req.params;

    const historia = await getUltimaHistoriaClinica(paciente_id);

    if (!historia) {
      return res.status(404).json({
        success: false,
        message: 'No hay historia clínica para este paciente',
      });
    }

    res.json({
      success: true,
      historia,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const actualizarHistoria = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      diagnostico,
      peso,
      talla,
      presion_arterial,
      frecuencia_cardiaca,
      temperatura,
      saturacion_oxigeno,
      medicamentos,
      observaciones,
    } = req.body;

    const historia = await updateHistoriaClinica(id, {
      diagnostico,
      peso,
      talla,
      presion_arterial,
      frecuencia_cardiaca,
      temperatura,
      saturacion_oxigeno,
      medicamentos,
      observaciones,
    });

    res.json({
      success: true,
      message: 'Historia clínica actualizada',
      historia,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const subirEstudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Archivo no proporcionado',
      });
    }

    const { historia_id } = req.params;
    const { tipo_estudio } = req.body;

    const estudio = await uploadEstudioAdjunto(
      historia_id,
      req.file,
      tipo_estudio || 'documento'
    );

    res.status(201).json({
      success: true,
      message: 'Estudio subido exitosamente',
      estudio,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export default {
  crearHistoria,
  obtenerHistoria,
  obtenerHistoriasPaciente,
  obtenerUltimaHistoria,
  actualizarHistoria,
  subirEstudio,
};
