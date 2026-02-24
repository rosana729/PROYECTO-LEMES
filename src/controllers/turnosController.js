import {
  createTurno,
  getTurnoById,
  getTurnosByPaciente,
  getTurnosByDate,
  getNextTurno,
  updateTurnoStatus,
  updateTurno,
  getTurnosStats,
} from '../services/turnosService.js';
import { handleError } from '../utils/errors.js';

export const crearTurno = async (req, res) => {
  try {
    const { paciente_id, fecha_hora, motivo, notas, medico_id } = req.body;

    const turno = await createTurno({
      paciente_id,
      fecha_hora,
      motivo,
      notas,
      medico_id,
    });

    res.status(201).json({
      success: true,
      message: 'Turno creado exitosamente',
      turno,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const obtenerTurno = async (req, res) => {
  try {
    const { id } = req.params;

    const turno = await getTurnoById(id);

    res.json({
      success: true,
      turno,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const turnosPorPaciente = async (req, res) => {
  try {
    const { paciente_id } = req.params;

    const turnos = await getTurnosByPaciente(paciente_id);

    res.json({
      success: true,
      turnos,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const turnosPorFecha = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({
        success: false,
        message: 'Fecha es requerida',
      });
    }

    const turnos = await getTurnosByDate(fecha);

    res.json({
      success: true,
      turnos,
      total: turnos.length,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const proximoTurno = async (req, res) => {
  try {
    const { fecha } = req.query;

    const turno = await getNextTurno(fecha);

    res.json({
      success: true,
      turno,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        success: false,
        message: 'Estado es requerido',
      });
    }

    const turno = await updateTurnoStatus(id, estado);

    res.json({
      success: true,
      message: 'Estado del turno actualizado',
      turno,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const iniciarConsulta = async (req, res) => {
  try {
    const { id } = req.params;

    const turno = await updateTurnoStatus(id, 'en_consulta');

    res.json({
      success: true,
      message: 'Consulta iniciada',
      turno,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const finalizarConsulta = async (req, res) => {
  try {
    const { id } = req.params;

    const turno = await updateTurnoStatus(id, 'atendido');

    // Obtener siguiente turno automáticamente
    let proximoTurnoData = null;
    try {
      proximoTurnoData = await getNextTurno();
    } catch (e) {
      // No hay próximos turnos
    }

    res.json({
      success: true,
      message: 'Consulta finalizada',
      turno,
      proximoTurno: proximoTurnoData,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const actualizarTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_hora, motivo, notas, medico_id, estado } = req.body;

    const turno = await updateTurno(id, {
      fecha_hora,
      motivo,
      notas,
      medico_id,
      estado,
    });

    res.json({
      success: true,
      message: 'Turno actualizado',
      turno,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const estadisticas = async (req, res) => {
  try {
    const { fecha } = req.query;

    const stats = await getTurnosStats(fecha);

    res.json({
      success: true,
      estadisticas: stats,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export default {
  crearTurno,
  obtenerTurno,
  turnosPorPaciente,
  turnosPorFecha,
  proximoTurno,
  cambiarEstado,
  iniciarConsulta,
  finalizarConsulta,
  actualizarTurno,
  estadisticas,
};
