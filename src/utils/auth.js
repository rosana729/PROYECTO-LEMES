import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/database.js';

export const hashPassword = async (password) => {
  return bcryptjs.hash(password, config.security.bcryptRounds);
};

export const comparePassword = async (plainPassword, hashed) => {
  return bcryptjs.compare(plainPassword, hashed);
};

export const generateToken = () => {
  return uuidv4();
};

export const generateSessionToken = () => {
  return `${Date.now()}_${uuidv4()}`;
};

export const calculateSessionExpiry = (hours = 24) => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
};

export default {
  hashPassword,
  comparePassword,
  generateToken,
  generateSessionToken,
  calculateSessionExpiry,
};
