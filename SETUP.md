# 🚀 GUÍA DE INSTALACIÓN - LEMES

## Requisitos Previos Obligatorios

- **Node.js** v20 o superior
- **npm** v10 o superior (incluido con Node.js)
- **Cuenta Supabase** con proyecto PostgreSQL
- Navegador web moderno

## 📋 Pasos de Instalación

### 1️⃣ Clonar o Descargar el Proyecto

```bash
# Si tienes git
git clone <URL-del-repositorio>
cd Lemes-Node

# O simplemente navega a la carpeta del proyecto
cd c:\xampp\htdocs\Lemes-Node
```

### 2️⃣ Instalar Dependencias

```bash
npm install
```

**Esto descargará e instalará todas las librerías necesarias** (puede tomar 2-5 minutos).

### 3️⃣ Configurar Variables de Entorno

#### Opción A: Usar Supabase (Recomendado para Producción)

1. Abre tu cuenta de Supabase en https://supabase.com
2. Ve a tu proyecto PostgreSQL
3. En **Settings** → **Database** → obtén:
   - URL de conexión: `postgresql://user:password@host:5432/postgres`
   - Service Role Key (en **Settings** → **API**)

4. Copia el archivo `.env.example`:
```bash
copy .env.example .env
```

5. Edita `.env` con tus credenciales Supabase:
```env
# Base de datos (obtener de Supabase)
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres?schema=public&sslmode=require
DIRECT_URL=postgresql://postgres:password@db.supabase.co:5432/postgres?schema=public&sslmode=require

# Supabase (obtener de Supabase Dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Seguridad (cambiar en producción)
SESSION_SECRET=tu_super_secreto_aqui_cambia_esto
JWT_SECRET=tu_jwt_secreto_aqui_cambia_esto
```

#### Opción B: Usar SQLite (Para Desarrollo Local Sin Supabase)

Si NO quieres usar Supabase, puedes usar SQLite localmente:

```env
# En .env
DATABASE_URL=file:./var/data.db
DIRECT_URL=file:./var/data.db

# El resto igual
```

### 4️⃣ Generar Cliente Prisma

```bash
npm run prisma:generate
```

### 5️⃣ Sincronizar Base de Datos

#### Si usas Supabase:
```bash
npm run prisma:db-push
```

#### Si usas SQLite:
```bash
npm run prisma:db-push
```

### 6️⃣ Poblar Base de Datos con Datos de Prueba

```bash
npm run seed
```

**Esto creará automáticamente:**
- ✅ 3 usuarios de prueba (admin, doctor, secretaria)
- ✅ 5 pacientes de ejemplo
- ✅ 5 turnos
- ✅ 3 historias clínicas

## ▶️ Ejecutar el Proyecto

### Modo Desarrollo (Con auto-reload)
```bash
npm run dev
```

### Modo Producción
```bash
npm start
```

**El servidor iniciará en:** `http://localhost:3000`

## 🔐 Acceder al Sistema

Abre tu navegador y ve a: **http://localhost:3000/login**

### Usuarios de Prueba

| **Email** | **Rol** | **Contraseña** |
|-----------|--------|----------------|
| admin@lemes.com | Admin | password123 |
| doctor@lemes.com | Doctor | password123 |
| secretaria@lemes.com | Secretaria | password123 |

## 🎯 Funcionalidades por Rol

### 👨‍💼 ADMIN
- Dashboard con estadísticas
- Gestión de usuarios (crear, editar, eliminar)
- Reportes del sistema
- Configuración

### 👨‍⚕️ DOCTOR
- Dashboard con siguiente paciente
- Iniciar/finalizar consultas
- Crear historias clínicas
- Ver agenda

### 👩‍💻 SECRETARIA
- Registrar nuevos pacientes
- Crear y gestionar turnos
- Ver agenda
- Buscar pacientes

## 📁 Estructura de Carpetas Clave

```
Lemes-Node/
├── src/
│   ├── controllers/      ← Lógica de las rutas
│   ├── routes/          ← Definición de endpoints API
│   ├── services/        ← Lógica de negocio
│   ├── views/           ← Plantillas EJS (HTML)
│   ├── public/          ← CSS, JS, imágenes
│   └── server.js        ← Punto de entrada
├── prisma/
│   └── schema.prisma    ← Modelo de datos
├── package.json         ← Dependencias
└── .env                 ← Configuración local
```

## 🔧 Comandos Disponibles

```bash
# Instalar dependencias
npm install

# Desarrollo con auto-reload
npm run dev

# Ejecutar en producción
npm start

# Prisma
npm run prisma:generate    # Generar cliente
npm run prisma:db-push     # Sincronizar BD
npm run prisma:migrate     # Crear migración
npm run prisma:studio      # Abrir Prisma Studio

# Cargar datos de prueba
npm run seed
```

## 🐛 Solución de Problemas

### Error: "Cannot find module 'express'"
```bash
npm install
```

### Error: "ECONNREFUSED" al conectar a BD
- ✅ Verificar credenciales en `.env`
- ✅ Verificar que Supabase está online
- ✅ Verificar firewall/whitelist de IPs

### Error: "sessionSecret is required"
- ✅ Asegurar que `SESSION_SECRET` está en `.env`

### El servidor inicia pero no puedo acceder
- ✅ Abrir `http://localhost:3000` (no `127.0.0.1`)
- ✅ Limpiar cookies del navegador
- ✅ Revisar console del navegador (F12)

### Puerto 3000 en uso
```bash
# Cambiar puerto en .env
PORT=3001

# O matar proceso en puerto 3000
# Windows: netstat -ano | findstr :3000
```

## 📊 Ver Base de Datos Graphicamente

### Con Prisma Studio:
```bash
npm run prisma:studio
```

Abrirá interfaz en `http://localhost:5555`

### Con Supabase Dashboard:
1. Ir a supabase.com
2. Seleccionar proyecto
3. Ir a **SQL Editor** → **Table Editor**

## 🔄 Actualizar Código

Si haces cambios al código:

```bash
# Reiniciar servidor (Ctrl+C y luego)
npm run dev
```

## 📈 Siguientes Pasos Recomendados

1. **Cambiar contraseñas de usuarios de prueba**
2. **Actualizar `SESSION_SECRET`** en producción
3. **Configurar dominio personalizado**
4. **Activar HTTPS en producción**
5. **Implementar rate limiting**
6. **Configurar backups automáticos**

## 📞 Soporte

Si tienes problemas:

1. Revisa el archivo README.md
2. Verifica los logs en la terminal
3. Abre la consola del navegador (F12)
4. Verifica que todas las variables de `.env` están correctas

## ⚠️ Notas Importantes

- **NO cambies** el archivo `prisma/schema.prisma` sin saber qué haces
- **NO compartas** el archivo `.env` con credenciales reales
- **NO uses** `password123` en producción
- **SI configura** HTTPS en producción
- **SI activa** rate limiting
- **SI usa** variables de entorno robustas

## ✅ Checklist Pre-Producción

- [ ] Cambiar todas las contraseñas
- [ ] Configurar HTTPS
- [ ] Activar CORS restrictivo
- [ ] Implementar rate limiting
- [ ] Configurar backups automáticos
- [ ] Activar logs de auditoría
- [ ] Revisar permisos de roles
- [ ] Probar en navegadores modernos
- [ ] Realizar pruebas de carga
- [ ] Documentar procesos internos

¡Listo! Tu sistema Lemes está preparado para usar. 🎉
