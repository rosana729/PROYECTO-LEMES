# Verificación de Instalación - LEMES

Use este archivo para verificar que todo está correctamente configurado.

## ✅ Checklist Pre-Instalación

### Requisitos del Sistema
- [ ] Node.js v20+ instalado (`node --version`)
- [ ] npm v10+ instalado (`npm --version`)
- [ ] Acceso a Supabase (si usas BD remota)
- [ ] ~500MB de espacio en disco
- [ ] Puerto 3000 disponible

### Comando de Verificación
```bash
node --version
npm --version
```

---

## ✅ Checklist Post-Instalación

### 1. Dependencias Instaladas
```bash
# Ejecutar en terminal
npm list

# Debe mostrar:
# lemes@1.0.0
# ├── express@4.18.2
# ├── prisma@5.7.1
# ├── bcryptjs@2.4.3
# └── ... (más paquetes)
```

### 2. Archivos de Configuración
- [ ] `.env` existe
- [ ] `.env` contiene: `DATABASE_URL`
- [ ] `.env` contiene: `SESSION_SECRET`
- [ ] (Opcional) `.env` contiene credenciales Supabase

**Verificar:**
```bash
# Windows PowerShell
Get-Content .env | Select-String "DATABASE_URL"
Get-Content .env | Select-String "SESSION_SECRET"
```

### 3. Directorios Principales
```
Lemes-Node/
├── src/
│   ├── controllers/     ✓
│   ├── routes/         ✓
│   ├── services/       ✓
│   ├── views/          ✓
│   ├── public/         ✓
│   ├── config/         ✓
│   ├── utils/          ✓
│   └── middlewares/    ✓
├── prisma/             ✓
├── node_modules/       ✓ (después de npm install)
└── var/                ✓ (para SQLite)
```

---

## ✅ Checklist del Servidor

### 1. Iniciar Servidor
```bash
npm run dev
```

Debe mostrar:
```
╔══════════════════════════════════════════════════════════════════════════════╗
║              🏥 LEMES - Sistema de Gestión Médica                           ║
║ 🚀 Servidor escuchando en: http://localhost:3000                             ║
║ 📊 Base de datos: [✓]                                                       ║
║ 🔐 Sesiones habilitadas                                                      ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### 2. Acceder a Login
- [ ] Abrir navegador en `http://localhost:3000`
- [ ] Ver pantalla de login
- [ ] Ingresar `admin@lemes.com` / `password123`

### 3. Verificar Dashboard
- [ ] 👨‍💼 Admin dashboard carga correctamente
- [ ] 👨‍⚕️ Doctor dashboard carga correctamente
- [ ] 👩‍💻 Secretaria dashboard carga correctamente

---

## ✅ Checklist API

### 1. Verificar Endpoints (Usar Postman o curl)

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@lemes.com\",\"password\":\"password123\"}"

# Debe retornar: { "success": true, "usuario": {...}, "sessionToken": "..." }
```

### 2. Verificar Autenticación
```bash
# (Cambiar TOKEN por el obtenido en login)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer {TOKEN}"

# Debe retornar: { "success": true, "usuario": {...} }
```

### 3. Verificar CRUD de Pacientes
```bash
# Listar pacientes
curl -X GET http://localhost:3000/api/pacientes \
  -H "Authorization: Bearer {TOKEN}"

# Debe retornar: { "success": true, "data": [...] }
```

---

## ✅ Checklist de Base de Datos

### 1. Verificar Conexión Prisma
```bash
npm run prisma:generate

# Debe completarse sin errores
# Mensaje esperado: "generated successfully"
```

### 2. Ver Estructura (Prisma Studio)
```bash
npm run prisma:studio

# Debe abrir: http://localhost:5555
# Y mostrar las 8 tablas de LEMES
```

### 3. Verificar Datos de Prueba
```bash
npm run seed

# Debe crear:
# ✓ 3 usuarios
# ✓ 5 pacientes
# ✓ 5 turnos
# ✓ 3 historias clínicas
```

---

## ✅ Checklist de Funcionalidades

### Flujo Admin
- [ ] Usar credencial: admin@lemes.com
- [ ] [ ] ✓ Dashboard carga
- [ ] [ ] ✓ Estadísticas se actualizan cada 30s
- [ ] [ ] ✓ Puede ver usuarios
- [ ] [ ] ✓ Puede crear usuario
- [ ] [ ] ✓ Puede cambiar contraseña

### Flujo Doctor
- [ ] Usar credencial: doctor@lemes.com
- [ ] ✓ Dashboard carga
- [ ] ✓ Panel "Siguiente Paciente" funciona
- [ ] ✓ Puede iniciar consulta
- [ ] ✓ Puede crear historia clínica
- [ ] ✓ Puede cargar estudios

### Flujo Secretaria
- [ ] Usar credencial: secretaria@lemes.com
- [ ] ✓ Dashboard carga
- [ ] ✓ Puede registrar paciente
- [ ] ✓ Puede crear turno
- [ ] ✓ Puede ver turnos del día
- [ ] ✓ Tabla de turnos se actualiza

---

## ✅ Checklist de Seguridad

- [ ] Cambiar `SESSION_SECRET` en `.env`
- [ ] Cambiar `JWT_SECRET` en `.env`
- [ ] NO commit de `.env` a git
- [ ] Contraseñas de test NO usadas en producción
- [ ] HTTPS habilitado en producción
- [ ] CORS configurado correctamente
- [ ] Cookies con flag `httpOnly` activo

---

## ✅ Checklist de Rendimiento

### Velocidad de Carga
- [ ] Login carga en < 1s
- [ ] Dashboard carga en < 2s
- [ ] Búsqueda de pacientes < 500ms

### Uso de Recursos
```bash
# Monitorear en Task Manager (Windows)
# RAM: ~150-200 MB
# CPU: < 5% en reposo
```

---

## ⚠️ Problemas Comunes & Soluciones

### Problema: "Cannot find module 'express'"
**Solución:**
```bash
npm install
```

### Problema: "DATABASE_URL is required"
**Solución:**
- Verificar que `.env` existe
- Verificar que `DATABASE_URL` está definido
- No dejar espacios en blanco

### Problema: "ECONNREFUSED 127.0.0.1:5432"
**Solución:**
- Verificar credenciales de BD en `.env`
- Verificar que Supabase está online
- Verificar IP/DNS está correcta

### Problema: "Puerto 3000 ya está en uso"
**Solución:**
```bash
# En .env cambiar:
PORT=3001

# O matar proceso:
# netstat -ano | findstr :3000
# (luego kill del PID)
```

### Problema: "SESSION_SECRET is required"
**Solución:**
- Agregar a `.env`: `SESSION_SECRET=tu_secreto_aqui`
- Cambiar el valor por algo aleatorio

### Problema: Contraseña incorrecta en login
**Solución:**
- Usuario de test: `admin@lemes.com`
- Contraseña de test: `password123`
- Si cambió contraseña, usar `/api/usuarios/cambiar-contrasena`

---

## 🧪 Tests Manuales

### Test 1: Flujo Completo de Turno
1. Login como Secretaria
2. Registrar paciente: Juan Pérez, DNI 12345678
3. Crear turno para ese paciente
4. Logout y login como Doctor
5. Ver "Siguiente Paciente"
6. Iniciar consulta
7. Crear historia clínica
8. Finalizar consulta

### Test 2: Búsqueda de Paciente
1. Login como Secretaria
2. Buscar paciente por DNI
3. Buscar paciente por nombre
4. Verificar resultados

### Test 3: Estadísticas en Tiempo Real
1. Abrir 2 tipos de dashboard (Admin, Doctor)
2. Cambiar estado de turno en Admin
3. Verificar que Doctor ve cambio sin refresh

---

## 📋 Reporte de Estado

**Cuando todo está bien:** ✅
- [ ] npm install exitoso
- [ ] npm run dev inicia sin errores
- [ ] Login funciona
- [ ] Dashboard carga contenido
- [ ] API responde tokens
- [ ] CRUD de pacientes funciona
- [ ] Flujo de turnos completo
- [ ] No hay errores en console (F12)

**Cuando hay problemas:** ⚠️
- Captura de pantalla del error
- Contenido de `.env` (sin credenciales reales)
- Output completo de `npm run dev`
- Versión de Node.js y npm
- Sistema operativo

---

## 🚀 Una Vez Verificado

Si TODO está ✅:

1. Configurar dominio personalizado
2. Activar HTTPS en producción
3. Cambiar contraseñas por defecto
4. Hacer backup de BD
5. Documentar procedimientos internos
6. Entrenar a usuarios
7. Monitorear en producción

---

**Generado:** 2024-01-20
**Versión:** 1.0
**Estado:** Ready for Production
