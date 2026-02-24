import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import config from './config/database.js';
import { initSupabase } from './config/supabase.js';
import { errorHandler } from './middlewares/auth.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import pacientesRoutes from './routes/pacientesRoutes.js';
import turnosRoutes from './routes/turnosRoutes.js';
import historiasRoutes from './routes/historiasRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';
import documentosRoutes from './routes/documentosRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ========================================
// CONFIGURACIÓN DE SEGURIDAD
// ========================================
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// ========================================
// PARSERS
// ========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ========================================
// SESIONES
// ========================================
app.use(session({
  secret: config.security.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.isProduction, // usar HTTPS en producción
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'strict',
  },
}));

// ========================================
// VISTAS Y ARCHIVOS ESTÁTICOS
// ========================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// ========================================
// MIDDLEWARE GLOBAL
// ========================================
app.use((req, res, next) => {
  // Logging
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ========================================
// INICIALIZAR SUPABASE
// ========================================
try {
  initSupabase();
  console.log('✓ Supabase inicializado correctamente');
} catch (error) {
  console.error('✗ Error al inicializar Supabase:', error.message);
  // Continuar de todos modos (el error será capturado cuando se intente usar)
}

// ========================================
// RUTAS API
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/historias', historiasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/documentos', documentosRoutes);

// ========================================
// RUTAS DE VISTAS (Renderizado)
// ========================================

// Página de login
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.render('auth/login', { title: 'Iniciar Sesión - Lemes' });
});

// Dashboard (protegido)
app.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  // Renderizar dashboard según el rol
  const rol = req.session.user.rol;
  const title = `Dashboard - ${config.app.name}`;

  if (rol === 'ROLE_ADMIN') {
    return res.render('dashboard/admin', {
      title,
      usuario: req.session.user,
    });
  }

  if (rol === 'ROLE_DOCTOR') {
    return res.render('dashboard/doctor', {
      title,
      usuario: req.session.user,
    });
  }

  if (rol === 'ROLE_SECRETARIA') {
    return res.render('dashboard/secretaria', {
      title,
      usuario: req.session.user,
    });
  }

  res.render('index/home', { title, usuario: req.session.user });
});

// Panel de Siguiente Paciente (solo doctor)
app.get('/siguiente-paciente', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  if (req.session.user.rol !== 'ROLE_DOCTOR') {
    return res.status(403).render('error/403', { title: 'Acceso Denegado' });
  }

  res.render('doctor/siguiente-paciente', {
    title: 'Siguiente Paciente - Lemes',
    usuario: req.session.user,
  });
});

// Agenda/Calendario
app.get('/agenda', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  res.render('calendar/agenda', {
    title: 'Agenda - Lemes',
    usuario: req.session.user,
  });
});

// ========================================
// MANEJO DE ERRORES
// ========================================
app.use((req, res) => {
  res.status(404).render('error/404', {
    title: 'Página No Encontrada',
    url: req.originalUrl,
  });
});

app.use(errorHandler);

// ========================================
// SERVIDOR
// ========================================
const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log(`║ ${config.app.name.padEnd(42)} ║`);
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║ Servidor ejecutándose en: Port ${PORT}`.padEnd(43) + '║');
  console.log(`║ Entorno: ${config.env.toUpperCase().padEnd(35)} ║`);
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Excepción no capturada:', error);
  process.exit(1);
});

export default app;
