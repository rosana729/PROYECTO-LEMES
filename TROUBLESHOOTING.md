# 🔧 SOLUCIÓN DE PROBLEMAS - LEMES

## Errores Comunes y Soluciones

### 1. Error: "Cannot find module 'express'"

**Síntoma:**
```
Error: Cannot find module 'express'
  at Module._resolveFilename
```

**Causas:**
- Node modules no instalados
- Carpeta corrupta

**Soluciones:**

```bash
# Opción 1: Instalar dependencias
npm install

# Opción 2: Limpiar y reinstalar
rm -r node_modules
npm install

# Opción 3: Usar npm cache clean (Windows)
npm cache clean --force
npm install
```

---

### 2. Error: "DATABASE_URL is required"

**Síntoma:**
```
Error: DATABASE_URL is required in environment variables
```

**Causas:**
- `.env` no existe
- `.env` está vacío
- DATABASE_URL no está configurado

**Soluciones:**

```bash
# 1. Verificar que .env existe
dir .env                    # Windows
ls -la .env                 # Linux/Mac

# 2. Si no existe, crear desde ejemplo
copy .env.example .env

# 3. Ver contenido
type .env                   # Windows
cat .env                    # Linux/Mac

# 4. Verificar que tiene valores
# Debe contener:
# DATABASE_URL=postgresql://...
# Session_SECRET=...
```

**Archivo `.env` mínimo:**
```env
# Base de datos (mínimo requerido)
DATABASE_URL=file:./var/data.db
DIRECT_URL=file:./var/data.db

# Seguridad
SESSION_SECRET=mi_secreto_super_seguro_12345

# Puerto (opcional)
PORT=3000

# Entorno (opcional)
NODE_ENV=development
```

---

### 3. Error: "ECONNREFUSED - Connection refused"

**Síntoma:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Causas:**
- Base de datos no está en línea
- Credenciales incorrectas
- Firewall bloqueando conexión

**Soluciones:**

```bash
# Opción 1: Usar SQLite local en lugar de Supabase
# En .env cambiar a:
DATABASE_URL=file:./var/data.db
DIRECT_URL=file:./var/data.db

# Opción 2: Verificar credenciales Supabase
# 1. Ir a https://supabase.com
# 2. Proyecto -> Settings -> Database
# 3. Copiar Connection String
# 4. Pegar en DATABASE_URL en .env

# Opción 3: Verificar conectividad
# Ping a servidor PostgreSQL (si lo conoces)
ping db.supabase.co
```

**Verificar BD:**
```bash
# Si usas Prisma, genera el cliente para validar
npm run prisma:generate

# Si usas Supabase, verifica credenciales en dashboard
```

---

### 4. Error: "Listen EADDRINUSE :::3000"

**Síntoma:**
```
Error: listen EADDRINUSE :::3000
Port 3000 is already in use
```

**Causas:**
- Otra aplicación usa puerto 3000
- Servidor anterior no cerró correctamente

**Soluciones:**

```bash
# Opción 1: Cambiar puerto en .env
# Agregar o editar:
PORT=3001

# Opción 2: Buscar proceso en puerto 3000
# Windows (PowerShell):
Get-Process | Where-Object {$_.Handles -like "*3000*"}
# O usar netstat:
netstat -ano | findstr :3000

# Opción 3: Matar proceso en Windows
# Reemplazar PID con el número obtenido:
taskkill /PID 1234 /F

# Opción 4: Esperar a que se libere el puerto
timeout /t 10

# Opción 5: Usar puerto diferente
npm run dev -- --port 3001
```

---

### 5. Error: "SESSION_SECRET is required"

**Síntoma:**
```
Error: SESSION_SECRET is required in environment variables
```

**Solución:**

```bash
# Editar .env y agregar:
SESSION_SECRET=tu_secreto_aqui_12345

# Generar secreto fuerte:
# Windows PowerShell:
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Minimum 1000000 -Maximum 9999999).ToString()))

# O simplemente usar cualquier string largo:
SESSION_SECRET=miSistemaLemesSuperSeguro2024QI!@#$%^&*
```

---

### 6. Error: "Invalid DATABASE_URL format"

**Síntoma:**
```
Error: Invalid DATABASE_URL format
```

**Solución:**

**Formato correcto para SQLite:**
```env
DATABASE_URL=file:./var/data.db
DIRECT_URL=file:./var/data.db
```

**Formato correcto para PostgreSQL (Supabase):**
```env
DATABASE_URL=postgresql://user:password@host:5432/postgres?schema=public&sslmode=require
DIRECT_URL=postgresql://user:password@host:5432/postgres?schema=public&sslmode=require
```

**NO hacer:**
```env
DATABASE_URL=postgresql://  # ❌ Incompleto
DATABASE_URL="postgresql://..." # ❌ Con comillas
DATABASE_URL=                 # ❌ Vacío
```

---

### 7. Error: "Prisma schema file not found"

**Síntoma:**
```
Error: Prisma schema file not found at /path/to/prisma/schema.prisma
```

**Solución:**

```bash
# Verificar que prisma/schema.prisma existe
dir prisma\schema.prisma          # Windows
ls -la prisma/schema.prisma       # Linux/Mac

# Si no existe, restaurar desde backup o recrear:
mkdir prisma
# Luego copiar schema.prisma del proyecto original
```

---

### 8. Error: "npx: command not found"

**Síntoma:**
```
command not found: npx
```

**Causas:**
- npm no está instalado
- PATH no configurado

**Soluciones:**

```bash
# Verificar npm instalado
npm --version

# Si no aparece, instalar Node.js desde https://nodejs.org

# En Windows, reiniciar terminal después de instalar Node.js
```

---

### 9. Error: "No such file or directory: 'npm start'"

**Síntoma:**
```
sh: 1: npm: not found
```

**Solución:**

```bash
# Instalar Node.js desde https://nodejs.org

# Verificar después de instalar:
node --version
npm --version

# Reiniciar terminal
```

---

### 10. Error: "TypeError: Cannot read property 'email' of undefined"

**Síntoma:**
En login, después de ingresar credenciales.

**Causas:**
- Usuario no existe en BD
- Campos vacíos

**Soluciones:**

```bash
# Opción 1: Cargar datos de prueba
npm run seed

# Opción 2: Verificar usuarios en BD
npm run prisma:studio
# Ir a tabla 'usuarios'
# Verificar que existe admin@lemes.com

# Opción 3: Crear usuario manualmente
# En Prisma Studio:
# Nueva row en usuarios
# email: admin@lemes.com
# password_hash: (dejar por ahora)
# nombre: Admin
# rol: ROLE_ADMIN
```

---

### 11. Error: "Invalid login attempt"

**Síntoma:**
```
Invalid login attempt: email or password incorrect
```

**Causas:**
- Contraseña incorrecta
- Usuario no existe

**Soluciones:**

```bash
# Usuarios de prueba:
Email: admin@lemes.com
Contraseña: password123

# o

Email: doctor@lemes.com
Contraseña: password123

# o

Email: secretaria@lemes.com
Contraseña: password123

# Si olvidaste contraseña:
# 1. Ir a Prisma Studio
npm run prisma:studio

# 2. En tabla 'usuarios', eliminar el usuario
# 3. Crear uno nuevo con contraseña conocida
# O ejecutar seed nuevamente
npm run seed
```

---

### 12. Error en Login: "Cannot POST /api/auth/login"

**Síntoma:**
```
Cannot POST /api/auth/login
404 Not Found
```

**Causas:**
- Servidor no está corriendo
- Rutas no están montadas

**Soluciones:**

```bash
# 1. Verificar que servidor está ejecutándose
npm run dev

# Debe mostrar:
# "Servidor escuchando en: http://localhost:3000"

# 2. Verificar que no hay errores de syntax
npm run dev

# Si hay errores, los mostrará

# 3. Reiniciar servidor
# Presionar Ctrl+C
# Ejecutar nuevamente: npm run dev
```

---

### 13. Error: "SUPABASE_URL is required"

**Síntoma:**
```
Error: SUPABASE_URL is required
```

**Solución:**

Si usas Supabase, agregar a `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Si **NO** usas Supabase, puedes dejar vacío o comentado:
```env
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_KEY=
```

---

### 14. Error: "View engine not found: 'ejs'"

**Síntoma:**
```
Error: view engine not found: 'ejs'
```

**Solución:**

```bash
# EJS debe estar instalado (debería estarlo)
npm install

# Si persiste:
npm uninstall ejs
npm install ejs@3.1.9
```

---

### 15. Dashboard no carga, pantalla en blanco

**Síntoma:**
- Página en blanco después de login

**Causas:**
- Error de JavaScript en navegador
- Rutas no configuradas

**Soluciones:**

```bash
# 1. Abrir consola del navegador (F12)
# Ver si hay errores en rojo

# 2. Verificar que rutas están montadas en server.js
# Debe contener:
# app.use('/api/pacientes', pacientesRoutes);
# app.use('/api/turnos', turnosRoutes);
# etc.

# 3. Verificar archivos de vista existen:
dir src\views\dashboard\          # Windows
ls -la src/views/dashboard/       # Linux/Mac

# 4. Limpiar navegador
# Ctrl+Shift+Delete -> Limpiar caché
# O abrir en modo incógnito
```

---

### 16. Error: "Cannot find property 'usuario' on res.locals"

**Síntoma:**
Error en vista

**Solución:**

```bash
# Esto significa que req.user no está definido
# Verificar que authMiddleware está aplicado:

# En server.js debe haber:
app.use((req, res, next) => {
  res.locals.usuario = req.user;
  next();
});

# O en la ruta específica:
router.get('/', authMiddleware, (req, res) => { ... });
```

---

### 17. Búsqueda de pacientes no funciona

**Síntoma:**
Búsqueda devuelve vacío

**Causas:**
- No hay pacientes en BD
- Búsqueda requiere mínimo 2 caracteres

**Soluciones:**

```bash
# 1. Verificar que hay pacientes (cargar seed)
npm run seed

# 2. Buscar con al menos 2 caracteres
# Búsqueda por: "ju" devuelve "Juan"
# Búsqueda por: "j" NO devuelve nada

# 3. Ver en Prisma Studio
npm run prisma:studio
# Ir a tabla 'pacientes'
# Verificar que tiene datos
```

---

## Errores en Consola del Navegador

### Error: "Failed to fetch"

**Causa:** API no responde

**Solución:**
```bash
# Verificar que servidor está en http://localhost:3000
# En consola del navegador (F12), Network tab
# Ver qué URL se llama
# Verificar que responde
```

### Error: "Unauthorized - 401"

**Causa:** Token expirado o ausente

**Solución:**
```bash
# Logout y volver a login
# Cookies deben tener httpOnly=true
# Verificar en Application -> Cookies
```

### Error: "Forbidden - 403"

**Causa:** Rol insuficiente para la acción

**Solución:**
```bash
# Verificar que el rol tiene permisos para eso
# Admin > Doctor > Secretaria (en orden de permisos)
```

---

## Problemas de Rendimiento

### Página lenta

**Soluciones:**

```bash
# 1. Verificar que hay índices en BD
npm run prisma:studio

# 2. Usar menos datos (agregar limit en query)
GET /api/pacientes?limit=10

# 3. Usar caché en navegador
# Browser: F12 -> Application -> Cache

# 4. Verificar conexión de red
# F12 -> Network tab
# Ver tiempo de respuesta de API
```

### Múltiples requests

**Soluciones:**

```bash
# En JavaScript, agregar debounce a búsquedas
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Uso:
searchInput.addEventListener('input', debounce(search, 300));
```

---

## Después de Arreglar el Error

1. **Reiniciar servidor:** `npm run dev`
2. **Limpiar caché navegador:** Ctrl+Shift+Delete
3. **Verificar en modo incógnito:** Ctrl+Shift+N
4. **Revisar consola:** F12 -> Console
5. **Revisar Network:** F12 -> Network

---

## Contacto & Más Ayuda

- Leer [README.md](README.md) para detalles técnicos
- Leer [API.md](API.md) para endpoints
- Leer [VERIFICATION.md](VERIFICATION.md) para testing
- Leer [SETUP.md](SETUP.md) para instalación

---

**Última actualización:** 2024-01-20
**Versión:** 1.0
