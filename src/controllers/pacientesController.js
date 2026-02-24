import {
  createPaciente,
  getPacienteByDNI,
  getPacienteById,
  getAllPacientes,
  updatePaciente,
  searchPacientes,
} from '../services/pacientesService.js';
import { handleError } from '../utils/errors.js';

export const registrarPaciente = async (req, res) => {
  try {
    const { dni, nombre, apellido, fecha_nacimiento, sexo, peso, talla, grupo_sanguineo, telefono, direccion, ciudad } = req.body;

    const paciente = await createPaciente({
      usuario_id: req.user.id,
      dni,
      nombre,
      apellido,
      fecha_nacimiento,
      sexo,
      peso,
      talla,
      grupo_sanguineo,
      telefono,
      direccion,
      ciudad,
    });

    res.status(201).json({
      success: true,
      message: 'Paciente registrado exitosamente',
      paciente,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const buscarPacientePorDNI = async (req, res) => {
  try {
    const { dni } = req.query;

    if (!dni) {
      return res.status(400).json({
        success: false,
        message: 'DNI es requerido',
      });
    }

    const paciente = await getPacienteByDNI(dni);

    res.json({
      success: true,
      paciente,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const obtenerPaciente = async (req, res) => {
  try {
    const { id } = req.params;

    const paciente = await getPacienteById(id);

    res.json({
      success: true,
      paciente,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const listarPacientes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await getAllPacientes(limit, offset);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const actualizarPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, fecha_nacimiento, sexo, peso, talla, grupo_sanguineo, telefono, direccion, ciudad, estado } = req.body;

    const paciente = await updatePaciente(id, {
      nombre,
      apellido,
      fecha_nacimiento,
      sexo,
      peso,
      talla,
      grupo_sanguineo,
      telefono,
      direccion,
      ciudad,
      estado,
    });

    res.json({
      success: true,
      message: 'Paciente actualizado exitosamente',
      paciente,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const buscar = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const pacientes = await searchPacientes(q.trim(), 20);

    res.json({
      success: true,
      data: pacientes,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export default {
  registrarPaciente,
  buscarPacientePorDNI,
  obtenerPaciente,
  listarPacientes,
  actualizarPaciente,
  buscar,
};
