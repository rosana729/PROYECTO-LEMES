# Lemes - Sistema de Gestión Médica

![Lemes](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/node-v20+-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

Sistema profesional de gestión médica construido con Node.js, Express, PostgreSQL y Prisma.

## 📋 Descripción

**Lemes** es una aplicación web moderna y completa para gestión de:
- 👥 Pacientes
- 📅 Turnos y citas
- 🏥 Historias clínicas
- 📄 Documentos adjuntos
- 👨‍💼 Usuarios y roles
- 📊 Estadísticas

## 🎯 Características Principales

### Roles y Permisos
- **Admin**: Gestión de usuarios, reportes, configuración
- **Doctor**: Consultas, historias clínicas, agenda
- **Secretaria**: Registro de pacientes, programación de turnos

### Funcionalidades
- ✅ Autenticación con email y contraseña
- ✅ Control de roles y permisos
- ✅ Búsqueda de pacientes por DNI
- ✅ Gestión de turnos (crear, actualizar estado)
- ✅ Historia clínica con cálculo de IMC automático
- ✅ Subida de documentos a Supabase Storage
- ✅ Agenda con FullCalendar
- ✅ Dashboard dinámico según rol
- ✅ Panel "Siguiente Paciente" para doctores
- ✅ Estadísticas en tiempo real

## 🛠️ Tech Stack

### Backend
- **Node.js** v20+
- **Express.js** v4
- **Prisma** ORM
- **PostgreSQL** (Supabase)
- **bcryptjs** para hasheo de contraseñas
- **Express Session** para sesiones

### Frontend
- **EJS** para renderizado
- **Bootstrap 5** 
- **FullCalendar** para agenda
- **Vanilla JavaScript**

### Infraestructura
- **Supabase** PostgreSQL + Storage
- **dotenv** para variables de entorno

## 📦 Instalación

### Requisitos Previos
```bash
- Node.js v20 o superior
- npm o yarn
- Cuenta de Supabase con BD PostgreSQL
```

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
```bash
cd Lemes-Node
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de Supabase:
```env
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres?schema=public&sslmode=require
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
SESSION_SECRET=your_super_secret_key
```

4. **Generar cliente Prisma**
```bash
npm run prisma:generate
```

5. **Ejecutar el servidor**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 🔐 Usuarios de Prueba

Después de ejecutar las migraciones, puedes usar:

| Email | Rol | Contraseña |
|-------|-----|-----------|
| admin@lemes.com | ROLE_ADMIN | password123 |
| doctor@lemes.com | ROLE_DOCTOR | password123 |
| secretaria@lemes.com | ROLE_SECRETARIA | password123 |

## 📂 Estructura del Proyecto

```
Lemes-Node/
├── src/
│   ├── config/              # Configuración (BD, Supabase)
│   ├── controllers/         # Controladores (lógica de rutas)
│   ├── middlewares/         # Middlewares (auth, roles, errores)
│   ├── routes/              # Definición de rutas
│   ├── services/            # Servicios (lógica de negocio)
│   ├── views/               # Plantillas EJS
│   │   ├── auth/           # Vistas de autenticación
│   │   ├── dashboard/      # Dashboards por rol
│   │   ├── partials/       # Componentes reutilizables
│   │   └── ...
│   ├── public/              # Archivos estáticos
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   ├── utils/               # Utilidades (validación, errores)
│   └── server.js            # Punto de entrada
├── prisma/
│   └── schema.prisma        # Esquema de Prisma
├── .env.example             # Variables de entorno
├── package.json
└── README.md
```

## 🚀 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar en modo watch

# Producción
npm start               # Iniciar servidor

# Prisma
npm run prisma:generate # Generar cliente Prisma
npm run prisma:migrate  # Ejecutar migraciones
npm run prisma:studio   # Abrir Prisma Studio
npm run prisma:db-push  # Sincronizar BD sin migración

# Seed (opcional)
npm run seed            # Poblar BD con datos de prueba
```

## 🔗 Rutas API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Pacientes
- `GET /api/pacientes` - Listar todos
- `POST /api/pacientes` - Crear nuevo
- `GET /api/pacientes/:id` - Obtener uno
- `PUT /api/pacientes/:id` - Actualizar
- `GET /api/pacientes/buscar` - Búsqueda general
- `GET /api/pacientes/buscar-dni` - Buscar por DNI

### Turnos
- `GET /api/turnos` - Listar
- `POST /api/turnos` - Crear
- `GET /api/turnos/:id` - Obtener
- `PATCH /api/turnos/:id/estado` - Cambiar estado
- `PATCH /api/turnos/:id/iniciar` - Iniciar consulta
- `PATCH /api/turnos/:id/finalizar` - Finalizar consulta
- `GET /api/turnos/proximo` - Próximo paciente (Doctor)
- `GET /api/turnos/estadisticas` - Estadísticas

### Historias Clínicas
- `POST /api/historias` - Crear
- `GET /api/historias/:id` - Obtener
- `GET /api/historias/paciente/:paciente_id` - Por paciente
- `PUT /api/historias/:id` - Actualizar
- `POST /api/historias/:historia_id/estudios` - Subir estudio

### Usuarios (Admin)
- `GET /api/usuarios` - Listar
- `POST /api/usuarios` - Crear
- `GET /api/usuarios/:id` - Obtener
- `PUT /api/usuarios/:id` - Actualizar
- `DELETE /api/usuarios/:id` - Eliminar

### Documentos
- `POST /api/documentos/:paciente_id` - Subir documento
- `GET /api/documentos/:id` - Obtener
- `GET /api/documentos/paciente/:paciente_id` - Por paciente
- `DELETE /api/documentos/:id` - Eliminar

## 🗄️ Modelo de Datos

### Tablas Principales

#### usuarios
- id, email (único), password_hash, nombre, apellido
- rol (ROLE_ADMIN, ROLE_DOCTOR, ROLE_SECRETARIA)
- estado, fecha_creacion, fecha_actualizacion

#### pacientes
- id, usuario_id (FK), dni (único)
- nombre, apellido, fecha_nacimiento, sexo, peso, talla
- grupo_sanguineo, telefono, direccion, ciudad
- estado, fecha_creacion, fecha_actualizacion

#### turnos
- id, paciente_id (FK), medico_id (FK)
- fecha_hora, estado, motivo, notas
- fecha_creacion, fecha_actualizacion

#### historias_clinicas
- id, paciente_id (FK), fecha
- diagnostico, peso, talla, imc
- presion_arterial, frecuencia_cardiaca, temperatura
- saturacion_oxigeno, medicamentos, observaciones

#### estudios_adjuntos
- id, historia_clinica_id (FK)
- tipo_estudio, nombre_archivo, url, url_supabase
- tamaño, mime_type, fecha_carga

#### documentos
- id, paciente_id (FK)
- tipo_documento, nombre_archivo, url, url_supabase
- tamaño, mime_type, descripcion, fecha_carga

#### sesiones
- id, usuario_id (FK), token_sesion (único)
- navegador_info, ip_address
- fecha_creacion, fecha_expiracion, fecha_cierre, activa

## 🔒 Seguridad

### Implementado:
- ✅ Hasheo de contraseñas con bcryptjs
- ✅ Validación de inputs
- ✅ CORS configurable
- ✅ Helmet para headers de seguridad
- ✅ Sesiones seguras (httpOnly, sameSite)
- ✅ Middleware de autenticación
- ✅ Control de roles y permisos
- ✅ Manejo centralizado de errores

### Mejoras Futuras:
- [ ] Rate limiting
- [ ] JWT tokens
- [ ] 2FA (Autenticación de dos factores)
- [ ] Auditoría de acciones
- [ ] Encriptación de datos sensibles

## 🐛 Resolución de Problemas

### Error de conexión a BD
- Verificar credenciales en `.env`
- Verificar que Supabase esté online
- Revisar firewall/whitelist IPs

### Error de Supabase Storage
- Verificar que el bucket existe
- Verificar permiso de bucket
- Revisar `SUPABASE_SERVICE_KEY`

### Sesión no persiste
- Limpiar cookies
- Verificar `SESSION_SECRET` en `.env`
- Revisar console del navegador para errores

## 📝 Licencia

MIT License - puedes usar libremente para fines comerciales y personales.

## 👥 Contacto y Soporte

Para reportar bugs o sugerir mejoras, por favor abre un issue en el repositorio.

---

**Versión**: 1.0.0  
**Última actualización**: Febrero 2026  
**Estado**: Producción
