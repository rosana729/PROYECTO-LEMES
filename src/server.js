import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import helmet from 'helmet';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
import('./config/supabase.js').then(
  ({ initSupabase }) => {
    if (initSupabase) {
      initSupabase();
      console.log('✓ Supabase inicializado');
    }
  }
).catch(err => console.warn('⚠️ Supabase:', err.message));

// ========================================
// RUTAS DE VISTAS (Renderizado) - REGISTRAR PRIMERO
// ========================================

// Middleware para verificar JWT en rutas protegidas
const verifyJWT = (req, res, next) => {
  const token = req.cookies?.authToken;
  
  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.warn('⚠️ JWT verification failed:', error.message);
    res.clearCookie('authToken');
    res.redirect('/login');
  }
};

// Página de login
app.get('/login', (req, res) => {
  const token = req.cookies?.authToken;
  
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect('/');
    } catch (error) {
      res.clearCookie('authToken');
    }
  }
  
  res.render('auth/login', { title: 'Iniciar Sesión - Lemes' });
});

// Dashboard (protegido)
app.get('/', verifyJWT, (req, res) => {
  // Renderizar dashboard según el rol
  const rol = req.user.rol;
  const title = `Dashboard - Lemes`;

  if (rol === 'ROLE_ADMIN') {
    return res.render('dashboard/admin', {
      title,
      usuario: req.user,
    });
  }

  if (rol === 'ROLE_DOCTOR') {
    return res.render('dashboard/doctor', {
      title,
      usuario: req.user,
    });
  }

  if (rol === 'ROLE_SECRETARIA') {
    return res.render('dashboard/secretaria', {
      title,
      usuario: req.user,
    });
  }

  res.render('index/home', { title, usuario: req.user });
});

// Panel de Siguiente Paciente (solo doctor)
app.get('/siguiente-paciente', verifyJWT, (req, res) => {
  if (req.user.rol !== 'ROLE_DOCTOR') {
    return res.status(403).render('error/403', { title: 'Acceso Denegado' });
  }

  res.render('doctor/siguiente-paciente', {
    title: 'Siguiente Paciente - Lemes',
    usuario: req.user,
  });
});

// Agenda/Calendario
app.get('/agenda', verifyJWT, (req, res) => {
  res.render('calendar/agenda', {
    title: 'Agenda - Lemes',
    usuario: req.user,
  });
});

// Health check para Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// RUTA DE PRUEBA - para verificar que /api/ funciona
app.post('/api/test-login', (req, res) => {
  console.log('✓ POST /api/test-login llamado');
  res.status(200).json({ 
    success: true, 
    message: 'Ruta de prueba funcionando',
    timestamp: new Date().toISOString()
  });
});

// ========================================
// CARGAR RUTAS API - Variable para control
// ========================================
let routesLoaded = false;
let routesLoading = false;

// Middleware para cargar rutas al primer request (compatible con Vercel serverless)
app.use(async (req, res, next) => {
  if (routesLoaded) {
    return next();
  }
  
  if (routesLoading) {
    // Si se están cargando, esperar
    return res.status(503).json({ error: 'Rutas cargándose, intente de nuevo' });
  }
  
  routesLoading = true;
  
  try {
    console.log('🚀 Cargando rutas API en primer request...');
    
    const [authMod, pacientesMod, turnosMod, historiasMod, usuariosMod, documentosMod] = await Promise.all([
      import('./routes/authRoutes.js'),
      import('./routes/pacientesRoutes.js'),
      import('./routes/turnosRoutes.js'),
      import('./routes/historiasRoutes.js'),
      import('./routes/usuariosRoutes.js'),
      import('./routes/documentosRoutes.js'),
    ]);

    // Registrar todas las rutas API
    app.use('/api/auth', authMod.default);
    app.use('/api/pacientes', pacientesMod.default);
    app.use('/api/turnos', turnosMod.default);
    app.use('/api/historias', historiasMod.default);
    app.use('/api/usuarios', usuariosMod.default);
    app.use('/api/documentos', documentosMod.default);

    console.log('✓ Todas las rutas API cargadas correctamente');
    
    routesLoaded = true;
    routesLoading = false;
    
    // Reintentar el request actual
    next();

  } catch (err) {
    console.error('❌ Error cargando rutas API:', err.message);
    console.error(err.stack);
    routesLoading = false;
    res.status(500).json({ error: 'Error al cargar rutas', message: err.message });
  }
});

// ========================================
// MANEJO DE ERRORES 404 (DEBE IR AL FINAL)
// ========================================
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error('Error en middleware:', err);
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
