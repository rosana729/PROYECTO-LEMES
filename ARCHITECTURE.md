# 🏗️ GUÍA DE ARQUITECTURA - LEMES

## Patrones y Mejores Prácticas

### MVC (Model-View-Controller)

**LEMES sigue patrón MVC + Services:**

```
Navegador (Cliente)
    ↓
Routes (req entra aquí)
    ↓
Controller (Procesa lógica HTTP)
    ↓
Service (Lógica de negocio)
    ↓
Prisma (Acceso a datos)
    ↓
PostgreSQL/SQLite (BD)
```

**Ejemplo: Búsqueda de pacientes**

```javascript
// 1. NAVEGADOR: GET /search?q=juan

// 2. ROUTE: src/routes/pacientesRoutes.js
router.get('/buscar', authMiddleware, pacientesController.buscarPacientes);

// 3. CONTROLLER: src/controllers/pacientesController.js
async buscarPacientes(req, res) {
  const { q } = req.query;
  const resultados = await pacientesService.searchPacientes(q);
  res.json({ success: true, data: resultados });
}

// 4. SERVICE: src/services/pacientesService.js
async searchPacientes(query) {
  return await prisma.paciente.findMany({
    where: {
      OR: [
        { nombre: { contains: query } },
        { dni: { contains: query } }
      ]
    }
  });
}

// 5. PRISMA: Genera SQL automáticamente
// SELECT * FROM pacientes WHERE nombre LIKE '%juan%' OR dni LIKE '%juan%'

// 6. BD: Devuelve resultados
```

---

## Estructura de Carpetas Detallada

### `/src/controllers/`
**Responsabilidad:** Recibir HTTP request, validar entrada, llamar servicio, enviar respuesta

**Patrón:**
```javascript
export const miControlador = async (req, res, next) => {
  try {
    // 1. Obtener datos del request
    const { email, password } = req.body;
    
    // 2. Validar
    if (!email || !password) {
      throw new ValidationError('Email y contraseña requeridos');
    }
    
    // 3. Llamar servicio
    const resultado = await miService.hacerAlgo(email, password);
    
    // 4. Enviar respuesta
    res.json({ success: true, data: resultado });
  } catch (error) {
    next(error); // Pasa al error handler
  }
};
```

### `/src/services/`
**Responsabilidad:** Lógica de negocio, validaciones, transformaciones

**Patrón:**
```javascript
export const miService = {
  async hacerAlgo(email, password) {
    // 1. Validar inputs
    if (!isValidEmail(email)) throw new ValidationError('Email inválido');
    
    // 2. Buscar datos
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) throw new NotFoundError('Usuario no existe');
    
    // 3. Lógica de negocio
    const esValido = await comparePassword(password, usuario.password_hash);
    if (!esValido) throw new UnauthorizedError('Contraseña incorrecta');
    
    // 4. Retornar resultado transformado
    return { id: usuario.id, email: usuario.email };
  }
};
```

### `/src/routes/`
**Responsabilidad:** Mapear URLs a controladores, aplicar middleware

**Patrón:**
```javascript
import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';
import * as controller from '../controllers/miController.js';

const router = Router();

// Rutas públicas
router.post('/crear', controller.crear);

// Rutas protegidas
router.get('/:id', authMiddleware, controller.obtener);

// Rutas por rol
router.delete('/:id', 
  authMiddleware, 
  roleMiddleware('ROLE_ADMIN'), 
  controller.eliminar
);

export default router;
```

### `/src/middlewares/`
**Responsabilidad:** Interceptar requests antes de llegar a controlador

**Patrón:**
```javascript
// Autenticación
export const authMiddleware = async (req, res, next) => {
  const token = req.get('Authorization')?.split(' ')[1];
  if (!token) throw new UnauthorizedError('Token requerido');
  
  const sesion = await prisma.sesion.findUnique({ where: { token_sesion: token } });
  if (!sesion || sesion.estado !== 'activo') {
    throw new UnauthorizedError('Sesión inválida');
  }
  
  req.user = sesion.usuario;
  next();
};

// Autorización por rol
export const roleMiddleware = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.rol)) {
    throw new ForbiddenError('Rol insuficiente');
  }
  next();
};

// Manejo de errores
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  
  res.status(statusCode).json({
    success: false,
    error: { code, message: err.message }
  });
};
```

### `/src/utils/`
**Responsabilidad:** Funciones reutilizables sin lógica de negocio

```javascript
// validators.js - Validar inputs
export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// errors.js - Clases de error personalizadas
export class ValidationError extends Error { ... }

// auth.js - Funciones de criptografía
export const hashPassword = (pwd) => bcrypt.hash(pwd, 10);
```

### `/src/views/`
**Responsabilidad:** Renderizar HTML con datos del servidor

**Patrón EJS:**
```ejs
<!-- Sintaxis EJS -->
<h1><%= usuario.nombre %></h1>

<!-- Loops -->
<% pacientes.forEach(p => { %>
  <div><%= p.nombre %></div>
<% }); %>

<!-- Condicionales -->
<% if (usuario.rol === 'ROLE_ADMIN') { %>
  <button>Admin Action</button>
<% } %>

<!-- Includes de partials -->
<%- include('partials/header') %>
```

---

## Data Flow Visual

```
┌─────────────────────────────────────────────────────────────┐
│                         USUARIO                             │
│              Abre navegador, hace acción                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │   VISTA (EJS Template)         │
        │   src/views/pacientes.ejs      │
        │   - Renderiza HTML             │
        │   - JavaScript envia request   │
        └────────┬───────────────────────┘
                 │ fetch('/api/pacientes')
                 ▼
        ┌────────────────────────────────┐
        │   ROUTE (Express Router)       │
        │   src/routes/                  │
        │   - Mapea URL a controller     │
        │   - Aplica middlewares         │
        └────────┬───────────────────────┘
                 │
                 ▼
        ┌────────────────────────────────┐
        │   MIDDLEWARE                   │
        │   - authMiddleware             │
        │   - roleMiddleware             │
        │   - Valida permisos            │
        └────────┬───────────────────────┘
                 │
                 ▼
        ┌────────────────────────────────┐
        │   CONTROLLER                   │
        │   src/controllers/             │
        │   - Recibe request             │
        │   - Valida datos básicos       │
        │   - Llama servicio             │
        └────────┬───────────────────────┘
                 │
                 ▼
        ┌────────────────────────────────┐
        │   SERVICE                      │
        │   src/services/                │
        │   - Lógica de negocio          │
        │   - Validaciones               │
        │   - Transformaciones           │
        └────────┬───────────────────────┘
                 │
                 ▼
        ┌────────────────────────────────┐
        │   PRISMA ORM                   │
        │   - Mapea a objetos            │
        │   - Genera SQL                 │
        └────────┬───────────────────────┘
                 │
                 ▼
        ┌────────────────────────────────┐
        │   BASE DE DATOS                │
        │   PostgreSQL / SQLite          │
        │   - Ejecuta SQL                │
        │   - Retorna data               │
        └────────┬───────────────────────┘
                 │
                 ▼
        ┌────────────────────────────────┐
        │   RESPONSE                     │
        │   { success: true, data: [...]}│
        │   Status: 200, 400, 401...     │
        └────────┬───────────────────────┘
                 │
                 ▼
        ┌────────────────────────────────┐
        │   VISTA recibe respuesta       │
        │   - Actualiza DOM              │
        │   - Muestra datos al usuario   │
        └────────────────────────────────┘
```

---

## Agregar Nuevas Funcionalidades

### 1. Agregar Nuevo Campo a Tabla

```javascript
// 1. Editar prisma/schema.prisma
model Paciente {
  id        String   @id @default(cuid())
  dni       String   @unique
  nombre    String
  apellido  String
  // NUEVO CAMPO:
  seguro_medico String?  // nullable
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// 2. Generar cliente
npm run prisma:generate

// 3. Sincronizar BD
npm run prisma:db-push

// 4. Usar en servicio
const paciente = await prisma.paciente.create({
  data: {
    dni: '12345678',
    nombre: 'Juan',
    apellido: 'Pérez',
    seguro_medico: 'OSDE'  // NUEVO CAMPO
  }
});
```

### 2. Agregar Nuevo Endpoint

```javascript
// 1. En src/services/pacientesService.js
export const pacientesService = {
  async obtenerPacientesPorSeguro(seguro) {
    return await prisma.paciente.findMany({
      where: { seguro_medico: seguro }
    });
  }
};

// 2. En src/controllers/pacientesController.js
export const obtenerPacientesPorSeguro = async (req, res, next) => {
  try {
    const { seguro } = req.query;
    if (!seguro) throw new ValidationError('Seguro requerido');
    
    const pacientes = await pacientesService.obtenerPacientesPorSeguro(seguro);
    res.json({ success: true, data: pacientes });
  } catch (error) {
    next(error);
  }
};

// 3. En src/routes/pacientesRoutes.js
router.get('/por-seguro', authMiddleware, obtenerPacientesPorSeguro);

// 4. Ya está auto-montado en server.js
// ✓ GET /api/pacientes/por-seguro?seguro=OSDE
```

### 3. Agregar Validación

```javascript
// En src/utils/validators.js
export const validateSeguro = (seguro) => {
  const validos = ['OSDE', 'IOMA', 'OBRA SOCIAL', 'PARTICULAR'];
  return validos.includes(seguro.toUpperCase());
};

// En servicio
async obtenerPacientesPorSeguro(seguro) {
  if (!validateSeguro(seguro)) {
    throw new ValidationError('Seguro no válido');
  }
  return await prisma.paciente.findMany({
    where: { seguro_medico: seguro }
  });
}
```

### 4. Agregar Rol o Permiso

```javascript
// En prisma/schema.prisma (no modificar)
// model Usuario {
//   rol: 'ROLE_ADMIN' | 'ROLE_DOCTOR' | 'ROLE_SECRETARIA' | 'ROLE_NUEVO'
// }

// En src/middlewares/auth.js
export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  DOCTOR: 'ROLE_DOCTOR',
  SECRETARIA: 'ROLE_SECRETARIA',
  NUEVO: 'ROLE_NUEVO'
};

// En rutas
router.post('/algo', 
  authMiddleware,
  roleMiddleware(ROLES.NUEVO, ROLES.ADMIN),
  controller
);
```

---

## Casos de Uso Comunes

### GET - Listar con Paginación

```javascript
// Service
async getPacientes(limit = 10, offset = 0) {
  const [data, total] = await Promise.all([
    prisma.paciente.findMany({ take: limit, skip: offset }),
    prisma.paciente.count()
  ]);
  return { data, total, limit, offset };
}

// Controller
const { limit, offset } = req.query;
const resultado = await pacientesService.getPacientes(
  parseInt(limit) || 10,
  parseInt(offset) || 0
);
res.json({ success: true, ...resultado });

// Ruta
// GET /api/pacientes?limit=5&offset=10
```

### POST - Crear con Validación

```javascript
// Service
async createPaciente(datos) {
  // Validar campos requeridos
  if (!datos.dni) throw new ValidationError('DNI requerido');
  if (!datos.nombre) throw new ValidationError('Nombre requerido');
  
  // Validar formato
  if (!validateDNI(datos.dni)) throw new ValidationError('DNI inválido');
  
  // Verificar duplicidad
  const existe = await prisma.paciente.findUnique({
    where: { dni: datos.dni }
  });
  if (existe) throw new ConflictError('DNI ya existe');
  
  // Crear
  return await prisma.paciente.create({ data: datos });
}

// Controller
const datos = req.body;
const paciente = await pacientesService.createPaciente(datos);
res.status(201).json({ success: true, data: paciente });
```

### PUT - Actualizar

```javascript
// Service
async updatePaciente(id, datos) {
  const existe = await prisma.paciente.findUnique({ where: { id } });
  if (!existe) throw new NotFoundError('Paciente no existe');
  
  return await prisma.paciente.update({
    where: { id },
    data: datos
  });
}

// Controller
const { id } = req.params;
const datos = req.body;
const paciente = await pacientesService.updatePaciente(id, datos);
res.json({ success: true, data: paciente });
```

### DELETE - Eliminar

```javascript
// Service
async deletePaciente(id) {
  const existe = await prisma.paciente.findUnique({ where: { id } });
  if (!existe) throw new NotFoundError('Paciente no existe');
  
  // Opcionalmente, verificar relaciones
  const turnosPendientes = await prisma.turno.count({
    where: { paciente_id: id, estado: 'pendiente' }
  });
  if (turnosPendientes > 0) {
    throw new ConflictError('No se puede eliminar: hay turnos pendientes');
  }
  
  return await prisma.paciente.delete({ where: { id } });
}

// Controller
const { id } = req.params;
await pacientesService.deletePaciente(id);
res.json({ success: true, message: 'Paciente eliminado' });
```

### Búsqueda Avanzada

```javascript
// Service
async searchPacientes(query) {
  const where = {
    OR: [
      { dni: { contains: query, mode: 'insensitive' } },
      { nombre: { contains: query, mode: 'insensitive' } },
      { apellido: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } }
    ]
  };
  
  return await prisma.paciente.findMany({ where, take: 10 });
}
```

---

## Testing Endpoints

### Con curl

```bash
# GET
curl http://localhost:3000/api/pacientes \
  -H "Authorization: Bearer TOKEN"

# POST
curl -X POST http://localhost:3000/api/pacientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"dni":"12345678","nombre":"Juan"}'

# PUT
curl -X PUT http://localhost:3000/api/pacientes/ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"nombre":"Juan Editado"}'

# DELETE
curl -X DELETE http://localhost:3000/api/pacientes/ID \
  -H "Authorization: Bearer TOKEN"
```

### Con Postman

1. Import -> Link -> https://...api-collection.json
2. Agregar variable `{{token}}` con token de login
3. Agregar variable `{{baseUrl}}` con http://localhost:3000
4. Test cada endpoint

---

## Mejores Prácticas

### ✅ Haz

```javascript
// 1. Valida siempre inputs
if (!email) throw new ValidationError('Email requerido');

// 2. Usa transacciones para operaciones críticas
const result = await prisma.$transaction([
  prisma.turno.update(...),
  prisma.paciente.update(...),
]);

// 3. Log importantes
console.log(`[${new Date().toISOString()}] Usuario creado: ${usuario.email}`);

// 4. Usa const, no var
const nombre = 'Juan';  // ✓ const
var nombre2 = 'Pedro';  // ✗ var

// 5. Async/await en lugar de .then()
const usuario = await prisma.usuario.findUnique(...);  // ✓
prisma.usuario.findUnique(...).then(u => ...);  // ✗
```

### ❌ No hagas

```javascript
// 1. No confíes en datos del usuario
res.send(req.body.nombre);  // ✗ Inseguro
sanitizeInput(req.body.nombre);  // ✓ Seguro

// 2. No dejes passwords en logs
console.log(usuario.password);  // ✗
console.log(usuario.email);  // ✓

// 3. No hagas queries sin validación
WHERE nombre = req.body.nombre  // ✗ SQL Injection
WHERE nombre = sanitize(req.body.nombre)  // ✓

// 4. No devuelvas datos sensibles
res.json(usuario);  // ✗ Incluye password_hash
const { password_hash, ...safeUsuario } = usuario;
res.json(safeUsuario);  // ✓

// 5. No hagas lógica compleja en controlador
// ✗ Controlador
controller.crearTurno = async (req, res) => {
  // Validar, calcular, guardar, enviar email...
}

// ✓ Servicio
service.crearTurno = async (datos) => {
  // Toda la lógica aquí
}
```

---

## Roadmap de Mejoras Sugeridas

1. **Rate limiting** - Proteger API de abuso
2. **WebSockets** - Actualizaciones en tiempo real
3. **Autenticación 2FA** - Mayor seguridad
4. **Auditoría completa** - Logs de cada acción
5. **Reportes PDF** - Exportar datos
6. **Email automáticos** - Recordatorios de turnos
7. **Recordatorios SMS** - Notificaciones móviles
8. **Calendario integrado** - FullCalendar completo
9. **Dashboard analítico** - Gráficos y estadísticas
10. **Tests automáticos** - Jest + Supertest

---

**Última actualización:** 2024-01-20
**Versión:** 1.0 - Arquitectura
