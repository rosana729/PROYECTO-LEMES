export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message, field = null) {
    super(message, 409, 'CONFLICT');
    this.field = field;
  }
}

export const handleError = (error, res) => {
  console.error('Error:', {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    stack: error.stack,
  });

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message,
      ...(error.field && { field: error.field }),
      timestamp: error.timestamp,
    });
  }

  // Error no controlado
  return res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'Ha ocurrido un error interno del servidor',
    timestamp: new Date().toISOString(),
  });
};

export default {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  handleError,
};
