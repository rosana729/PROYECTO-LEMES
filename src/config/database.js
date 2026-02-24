import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const config = {
  // Entorno
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Aplicación
  app: {
    name: process.env.APP_NAME || 'Lemes',
    description: process.env.APP_DESCRIPTION || 'Sistema de Gestión Médica Profesional',
    version: process.env.APP_VERSION || '1.0.0',
  },

  // Base de datos
  database: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'medical-documents',
  },

  // Sesiones y seguridad
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'default_secret_change_in_production',
    jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_change_in_production',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
  },

  // Logs
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },

  // Archivos
  files: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 52428800, // 50MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png,xls,xlsx').split(','),
    uploadDir: path.join(__dirname, '..', 'uploads'),
  },

  // Rutas
  paths: {
    root: path.join(__dirname, '..'),
    src: path.join(__dirname, '..', 'src'),
    public: path.join(__dirname, '..', 'src', 'public'),
    uploads: path.join(__dirname, '..', 'uploads'),
    var: path.join(__dirname, '..', 'var'),
  },
};

export default config;
