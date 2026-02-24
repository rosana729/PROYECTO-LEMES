import {
  uploadDocumento,
  getDocumentoById,
  getDocumentosByPaciente,
  deleteDocumento,
} from '../services/documentosService.js';
import { handleError } from '../utils/errors.js';

export const subirDocumento = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Archivo no proporcionado',
      });
    }

    const { paciente_id } = req.params;
    const { tipo_documento } = req.body;

    const documento = await uploadDocumento(
      paciente_id,
      req.file,
      tipo_documento || 'documento'
    );

    res.status(201).json({
      success: true,
      message: 'Documento subido exitosamente',
      documento,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const obtenerDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await getDocumentoById(id);

    res.json({
      success: true,
      documento,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const documentosPaciente = async (req, res) => {
  try {
    const { paciente_id } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const documentos = await getDocumentosByPaciente(paciente_id, limit);

    res.json({
      success: true,
      documentos,
      total: documentos.length,
    });
  } catch (error) {
    handleError(error, res);
  }
};

export const eliminarDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteDocumento(id);

    res.json({
      success: true,
      message: 'Documento eliminado exitosamente',
    });
  } catch (error) {
    handleError(error, res);
  }
};

export default {
  subirDocumento,
  obtenerDocumento,
  documentosPaciente,
  eliminarDocumento,
};
