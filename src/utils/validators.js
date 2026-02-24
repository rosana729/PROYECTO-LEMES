import validator from 'validator';

export const validateEmail = (email) => {
  return validator.isEmail(email);
};

export const validatePassword = (password) => {
  // Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

export const validateDNI = (dni) => {
  // Validación simple de DNI (para Argentina, ajusta según tu país)
  return /^\d{7,8}$/.test(dni.replace(/\D/g, ''));
};

export const validatePhoneNumber = (phone) => {
  return validator.isMobilePhone(phone, 'es-AR'); // Ajusta según tu país
};

export const validateDate = (date) => {
  return validator.isISO8601(date);
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return validator.trim(input);
};

export const sanitizeEmail = (email) => {
  return validator.normalizeEmail(email);
};

export const isValidRole = (role) => {
  const validRoles = ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_SECRETARIA'];
  return validRoles.includes(role);
};

export const isValidTurnoStatus = (status) => {
  const validStatus = ['pendiente', 'confirmado', 'en_consulta', 'atendido', 'ausente', 'cancelado'];
  return validStatus.includes(status);
};

export const calculateIMC = (weight, height) => {
  if (!weight || !height || weight <= 0 || height <= 0) return null;
  // height es en cm, convertir a metros
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
};

export default {
  validateEmail,
  validatePassword,
  validateDNI,
  validatePhoneNumber,
  validateDate,
  sanitizeInput,
  sanitizeEmail,
  isValidRole,
  isValidTurnoStatus,
  calculateIMC,
};
