import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar configuración de forma síncrona
let config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  app: { name: 'Lemes' },
  database: { url: process.env.DATABASE_URL },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
  },
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'default_secret_2024',
  }
};

const app = express();

// ========================================
// CONFIGURACIÓN DE SEGURIDAD
// ========================================
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
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
  secret: config.security?.sessionSecret || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  },
}));

// ========================================
// VISTAS Y ARCHIVOS ESTÁTICOS
// ========================================
app.set('view engine', 'ejs');
const viewsPath = path.join(__dirname, 'views');
if (fs.existsSync(viewsPath)) {
  app.set('views', viewsPath);
}
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// ========================================
// MIDDLEWARE GLOBAL
// ========================================
app.use((req, res, next) => {
  // Logging
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ========================================
// INICIALIZAR SUPABASE (si está disponible)
// ========================================
// Cargar de forma lazy
(async () => {
  try {
    const { initSupabase } = await import('./config/supabase.js');
    if (initSupabase) {
      initSupabase();
      console.log('✓ Supabase inicializado');
    }
  } catch (error) {
    console.warn('⚠️ Supabase:', error.message);
  }
})();

// ========================================
// CARGAR RUTAS API (con safety checks)
// ========================================
(async () => {
  try {
    const { default: authRoutes } = await import('./routes/authRoutes.js');
    if (authRoutes) app.use('/api/auth', authRoutes);
  } catch (err) {
    console.warn('⚠️ Auth routes:', err.message);
  }

  try {
    const { default: pacientesRoutes } = await import('./routes/pacientesRoutes.js');
    if (pacientesRoutes) app.use('/api/pacientes', pacientesRoutes);
  } catch (err) {
    console.warn('⚠️ Pacientes routes:', err.message);
  }

  try {
    const { default: turnosRoutes } = await import('./routes/turnosRoutes.js');
    if (turnosRoutes) app.use('/api/turnos', turnosRoutes);
  } catch (err) {
    console.warn('⚠️ Turnos routes:', err.message);
  }

  try {
    const { default: historiasRoutes } = await import('./routes/historiasRoutes.js');
    if (historiasRoutes) app.use('/api/historias', historiasRoutes);
  } catch (err) {
    console.warn('⚠️ Historias routes:', err.message);
  }

  try {
    const { default: usuariosRoutes } = await import('./routes/usuariosRoutes.js');
    if (usuariosRoutes) app.use('/api/usuarios', usuariosRoutes);
  } catch (err) {
    console.warn('⚠️ Usuarios routes:', err.message);
  }

  try {
    const { default: documentosRoutes } = await import('./routes/documentosRoutes.js');
    if (documentosRoutes) app.use('/api/documentos', documentosRoutes);
  } catch (err) {
    console.warn('⚠️ Documentos routes:', err.message);
  }
})();

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

// Health check para Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========================================
// MANEJO DE ERRORES
// ========================================
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// ========================================
// SERVIDOR - Solo escuchar en desarrollo
// ========================================
if (!process.env.VERCEL && config.isDevelopment) {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`\n✓ Servidor ejecutándose en http://localhost:${PORT}\n`);
  });
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Excepción no capturada:', error.message);
});

export default app;
