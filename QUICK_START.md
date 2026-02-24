# ⚡ INICIO RÁPIDO - LEMES (5 minutos)

## Para Prueba Rápida (SQLite - Sin Supabase)

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo .env
copy .env.example .env

# 3. En .env, cambiar estas líneas:
# DATABASE_URL=file:./var/data.db
# DIRECT_URL=file:./var/data.db
# SESSION_SECRET=mi_secreto_temporal

# 4. Sincronizar BD
npm run prisma:db-push

# 5. Cargar datos de prueba
npm run seed

# 6. Ejecutar
npm run dev
```

**Luego abre:** `http://localhost:3000`

**Usuario:** `admin@lemes.com` | **Contraseña:** `password123`

---

## Para Producción (Supabase)

```bash
# 1. Obtener credenciales de Supabase
# - DATABASE_URL desde Supabase > Settings > Database
# - SUPABASE_URL y ANON_KEY desde Supabase > Settings > API

# 2. Copiar y llenar .env
copy .env.example .env
# Editar valores de Supabase

# 3. Instalar
npm install

# 4. Sincronizar
npm run prisma:db-push

# 5. Cargar datos (opcional)
npm run seed

# 6. Ejecutar
npm start
```

---

## 3 Scripts Principales

| Script | Uso |
|--------|-----|
| `npm run dev` | Desarrollo con reload automático |
| `npm start` | Producción |
| `npm run seed` | Cargar datos de prueba |

---

## Soluciones Rápidas

❌ **Error de dependencias:** `npm install`
❌ **Error de BD:** Verificar `.env` con credenciales correctas
❌ **Puerto en uso:** Cambiar `PORT=3001` en `.env`

---

## 🎯 Prueba Las 3 Vistas

1. **Admin:** admin@lemes.com → Dashboard con usuarios
2. **Doctor:** doctor@lemes.com → "Siguiente Paciente"
3. **Secretaria:** secretaria@lemes.com → Gestión de turnos

¡Listo! 🚀
