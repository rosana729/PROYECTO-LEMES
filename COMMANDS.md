# ⌨️ REFERENCIA RÁPIDA DE COMANDOS - LEMES

## 🚀 Comandos Esenciales

```bash
# Instalación
npm install                           # Instalar todas las dependencias

# Desarrollo
npm run dev                           # Ejecutar en modo desarrollo con reload

# Producción
npm start                             # Ejecutar en modo producción

# Base de datos
npm run prisma:generate               # Generar cliente Prisma (después de cambios en schema)
npm run prisma:db-push                # Sincronizar schema con BD
npm run prisma:migrate create         # Crear migración manual
npm run prisma:studio                 # Abrir interfaz gráfica de BD (http://localhost:5555)
npm run prisma:format                 # Formatear schema.prisma

# Datos de prueba
npm run seed                           # Cargar 3 usuarios, 5 pacientes, 5 turnos, 3 historias
```

---

## 🔄 Comandos de Desarrollo

### Trabajar con Cambios

```bash
# Si cambias prisma/schema.prisma
npm run prisma:generate

# Si cambias código (reinicia automáticamente con npm run dev)
# Presionar Ctrl+C y luego:
npm run dev

# Si necesitas un nuevo script npm
# Editar package.json -> "scripts" {}
```

### Limpiar Proyecto

```bash
# Limpiar node_modules
rm -rf node_modules                   # Linux/Mac
rmdir /s /q node_modules              # Windows PowerShell

# Reinstalar
npm install

# Limpiar caché npm
npm cache clean --force
```

### Verificar Versiones

```bash
node --version                        # Debe ser v20+
npm --version                         # Debe ser v10+
```

---

## 🗄️ Prisma Studio (Interfaz Gráfica)

```bash
npm run prisma:studio

# Abre: http://localhost:5555
# Permite ver y editar datos de todas las tablas
# Operaciones:
#   - Ver registros
#   - Crear nuevos registros
#   - Editar registros
#   - Eliminar registros
```

---

## 🌐 URL Importante

| Componente | URL |
|-----------|-----|
| **Aplicación** | http://localhost:3000 |
| **Login** | http://localhost:3000/login |
| **API** | http://localhost:3000/api |
| **Prisma Studio** | http://localhost:5555 |

---

## 🔐 Credenciales de Prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@lemes.com | password123 | Admin |
| doctor@lemes.com | password123 | Doctor |
| secretaria@lemes.com | password123 | Secretaria |

---

## 📁 Estructura de Carpetas Rápida

```
src/
├── controllers/      ← Maneja HTTP requests
├── routes/          ← Define endpoints API
├── services/        ← Lógica de negocio
├── views/           ← HTML templates (EJS)
├── public/css       ← Estilos CSS
├── public/js        ← JavaScript del navegador
├── middlewares/     ← Autenticación, errores
├── utils/           ← Funciones auxiliares
├── config/          ← Configuración de BD
└── server.js        ← Punto de entrada

prisma/
└── schema.prisma    ← Modelo de datos

.env                 ← Variables de configuración (NO incluir en git)
package.json         ← Dependencias y scripts
```

---

## 📊 Tablas de Base de Datos

```
usuarios             → Cuentas de usuario
pacientes            → Información de pacientes
turnos               → Citas/Turnos médicos
historias_clinicas   → Registros médicos
estudios_adjuntos    → Estudios/Análisis
documentos           → Documentos generales
sesiones             → Sesiones de usuario
```

---

## 🔑 Variables de .env Esenciales

```bash
# Base de datos
DATABASE_URL=postgresql://...        # Conexión PostgreSQL o SQLite
DIRECT_URL=postgresql://...          # URL directa (sin pool)

# Seguridad
SESSION_SECRET=tu_secreto_aqui       # Debe ser string largo y único

# Supabase (opcional, si usas BD remota)
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# App
PORT=3000                            # Puerto del servidor
NODE_ENV=development                 # development o production
```

---

## 🚨 Cuando Algo No Funciona

```bash
# 1. Revisar consola de Node.js
# Debe mostrar: "Servidor escuchando en: http://localhost:3000"

# 2. Revisar consola del navegador (F12)
# Network tab -> Filtrar por "Fetch/XHR"
# Ver estado HTTP (200, 404, 500, etc.)

# 3. Revisar base de datos
npm run prisma:studio

# 4. Revisar .env tiene todas las variables requeridas
cat .env            # Linux/Mac
type .env           # Windows

# 5. Reiniciar servidor
# Ctrl+C en terminal
npm run dev

# 6. Limpiar caché navegador
# Ctrl+Shift+Delete o Cmd+Shift+Delete
```

---

## 📝 Logs y Debugging

```bash
# En terminal durante npm run dev
# Verás logs como:
# ✓ Servidor escuchando
# ✓ BD conectada
# ✓ Supabase inicializado
# ✓ GET /login
# ✓ POST /api/auth/login
# ✓ Error: conexión denegada

# En navegador (F12 Console)
# Ver errores JavaScript
# Ver advertencias
# Ejecutar comandos JavaScript

# En Prisma Studio
# Ver query logs
# Ver datos en tiempo real
```

---

## 🔗 Endpoints API Principales

### Autenticación
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Pacientes
```
GET    /api/pacientes
POST   /api/pacientes
GET    /api/pacientes/:id
PUT    /api/pacientes/:id
GET    /api/pacientes/buscar-dni?dni=123
GET    /api/pacientes/buscar?q=juan
```

### Turnos
```
GET    /api/turnos
POST   /api/turnos
GET    /api/turnos/:id
GET    /api/turnos/proximo
GET    /api/turnos/fecha?fecha=2024-01-20
GET    /api/turnos/estadisticas
PATCH  /api/turnos/:id/estado
PATCH  /api/turnos/:id/iniciar
PATCH  /api/turnos/:id/finalizar
```

### Historias Clínicas
```
POST   /api/historias
GET    /api/historias/:id
PUT    /api/historias/:id
GET    /api/historias/paciente/:id
POST   /api/historias/:id/estudios
```

### Usuarios (Admin)
```
GET    /api/usuarios
POST   /api/usuarios
GET    /api/usuarios/:id
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id
```

### Documentos
```
POST   /api/documentos/:paciente_id
GET    /api/documentos/paciente/:id
DELETE /api/documentos/:id
```

---

## ✅ Checklist de Verificación

```bash
# Después de npm install
[ ] node_modules/ existe
[ ] npm list funciona

# Después de configurar .env
[ ] DATABASE_URL está definido
[ ] SESSION_SECRET está definido
[ ] Archivo .env NO está en git

# Después de npm run dev
[ ] Servidor inicia sin errores
[ ] "Servidor escuchando en: http://localhost:3000"
[ ] Puedo acceder a http://localhost:3000

# Después de login
[ ] Dashboard carga el contenido
[ ] Datos de usuario aparecen
[ ] No hay errores en consola (F12)

# Funcionalidades básicas
[ ] Búsqueda de pacientes funciona
[ ] Puede ver turnos
[ ] API responde tokens
```

---

## 🐛 Errores Típicos Atajos

| Problema | Comando Rápido |
|----------|-----------------|
| npm no funciona | `npm install -g npm@latest` |
| Node.js no instalado | Ir a https://nodejs.org |
| Puerto 3000 ocupado | Cambiar `PORT=3001` en .env |
| BD no conecta | Verificar `DATABASE_URL` en .env |
| Cambié schema.prisma | `npm run prisma:generate` |
| Quiero datos de prueba | `npm run seed` |
| Ver datos en gráfico | `npm run prisma:studio` |
| Limpiar todo | `rm -rf node_modules && npm install` |

---

## 💡 Tips Productivos

```bash
# Ejecutar en segundo plano (desarrollo)
npm run dev &                         # Linux/Mac
npm run dev (en una terminal separada) # Windows

# Ver logs en tiempo real
npm run dev 2>&1 | tee logs.txt       # Guardar logs

# Usar nodemon para auto-reload (si lo prefieres)
npm install -g nodemon
nodemon src/server.js

# Debuggear con Node
node --inspect src/server.js
# Luego abrir: chrome://inspect

# Test de API con curl
curl -X GET http://localhost:3000/api/pacientes \
  -H "Authorization: Bearer TOKEN"
```

---

## 📞 Ayuda Rápida

| Pregunta | Respuesta |
|----------|-----------|
| ¿Dónde veo los errores? | Terminal (npm run dev) y F12 en navegador |
| ¿Cómo cambio contraseña? | POST /api/usuarios/cambiar-contrasena |
| ¿Cómo subo archivos? | POST /api/documentos o /api/historias/estudios |
| ¿Cuál es el BD por defecto? | SQLite en var/data.db (puedes cambiar a Supabase) |
| ¿Los datos persisten? | Sí, se guardan en BD (SQLite o Supabase) |
| ¿Puedo tener múltiples servidores? | Sí, pero necsitas BD compartida |
| ¿Cómo deploy a producción? | Ver SETUP.md, sección "Producción" |

---

## 🎯 Flujos Comunes

### Agregar Nueva API
```
1. Crear servicio en src/services/
2. Crear controller en src/controllers/
3. Agregar rutas en src/routes/
4. Montar rutas en src/server.js
5. Probar con curl o Postman
```

### Cambiar Modelo de Datos
```
1. Editar prisma/schema.prisma
2. npm run prisma:generate
3. npm run prisma:db-push
4. Reiniciar servidor: npm run dev
```

### Agregar Nueva Vista
```
1. Crear archivo en src/views/
2. Usar EJS syntax con <% %>
3. En servidor, renderizar: res.render('archivo')
4. Pasar datos: res.render('archivo', { dato: valor })
```

---

**Última actualización:** 2024-01-20
**Versión:** 1.0 - Quick Reference
