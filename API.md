# 📚 DOCUMENTACIÓN API - LEMES

## Base URL

```
http://localhost:3000/api
```

## Autenticación

Todos los endpoints (excepto `/auth/login`) requieren:
- Header: `Authorization: Bearer {token}`
- Cookie: `LEMES_SESSION={sessionId}`

## Endpoints

### 🔐 AUTENTICACIÓN

#### POST /auth/login
**Sin autenticación**

Login con email y contraseña.

```json
{
  "email": "admin@lemes.com",
  "password": "password123"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "usuario": {
    "id": "uuid",
    "email": "admin@lemes.com",
    "nombre": "Administrador",
    "rol": "ROLE_ADMIN",
    "estado": "activo"
  },
  "sessionToken": "token_uuid"
}
```

---

#### POST /auth/logout
**Requerido: Autenticación**

Cierra la sesión actual.

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

---

#### GET /auth/me
**Requerido: Autenticación**

Obtiene los datos del usuario actual.

**Respuesta (200):**
```json
{
  "success": true,
  "usuario": {
    "id": "uuid",
    "email": "admin@lemes.com",
    "nombre": "Administrador",
    "apellido": "Sistema",
    "rol": "ROLE_ADMIN",
    "estado": "activo"
  }
}
```

---

### 👥 PACIENTES

#### GET /pacientes
**Requerido: Autenticación**

Obtiene listado de pacientes (paginado).

**Query Parameters:**
- `limit` (opcional): Cantidad de registros (default: 10)
- `offset` (opcional): Desplazamiento (default: 0)

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "dni": "12345678",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@email.com",
      "telefono": "+541234567890",
      "peso": 75,
      "talla": 180,
      "grupo_sanguineo": "O+",
      "estado": "activo"
    }
  ],
  "total": 50,
  "limit": 10,
  "offset": 0
}
```

---

#### POST /pacientes
**Requerido: Autenticación (Secretaria/Admin)**

Registra un nuevo paciente.

```json
{
  "dni": "12345678",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@email.com",
  "telefono": "+541234567890",
  "peso": 75,
  "talla": 180,
  "grupo_sanguineo": "O+",
  "historia_medica": "Sin antecedentes"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Paciente registrado exitosamente",
  "data": {
    "id": "uuid",
    "dni": "12345678",
    "nombre": "Juan",
    "apellido": "Pérez"
  }
}
```

---

#### GET /pacientes/buscar-dni
**Requerido: Autenticación**

Busca un paciente por DNI (exacto o parcial).

**Query Parameters:**
- `dni` (requerido): DNI a buscar

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "dni": "12345678",
      "nombre": "Juan",
      "apellido": "Pérez",
      "email": "juan@email.com",
      "estado": "activo",
      "turnos": [
        {
          "id": "uuid",
          "fecha_hora": "2024-01-20T14:00:00",
          "estado": "pendiente"
        }
      ]
    }
  ]
}
```

---

#### GET /pacientes/buscar
**Requerido: Autenticación**

Búsqueda general de pacientes (nombre, apellido, DNI).

**Query Parameters:**
- `q` (requerido): Mínimo 2 caracteres

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Juan",
      "apellido": "Pérez",
      "dni": "12345678",
      "email": "juan@email.com"
    }
  ]
}
```

---

#### GET /pacientes/:id
**Requerido: Autenticación**

Obtiene detalle de un paciente específico.

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "dni": "12345678",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@email.com",
    "telefono": "+541234567890",
    "peso": 75,
    "talla": 180,
    "grupo_sanguineo": "O+",
    "estado": "activo",
    "historias_clinicas": [
      {
        "id": "uuid",
        "fecha": "2024-01-20",
        "diagnostico": "Hipertensión"
      }
    ]
  }
}
```

---

#### PUT /pacientes/:id
**Requerido: Autenticación**

Actualiza datos de un paciente.

```json
{
  "telefono": "+541234567890",
  "peso": 76,
  "talla": 180,
  "grupo_sanguineo": "O+",
  "estado": "activo"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Paciente actualizado"
}
```

---

### 📅 TURNOS

#### GET /turnos/estadisticas
**Requerido: Autenticación**

Obtiene estadísticas de turnos para una fecha.

**Query Parameters:**
- `fecha` (opcional): YYYY-MM-DD (default: hoy)

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "total": 15,
    "pendiente": 5,
    "confirmado": 4,
    "en_consulta": 2,
    "atendido": 3,
    "cancelado": 1,
    "no_asistio": 0
  }
}
```

---

#### GET /turnos/proximo
**Requerido: Autenticación (Doctor)**

Obtiene el próximo turno para atender.

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "turno": {
      "id": "uuid",
      "fecha_hora": "2024-01-20T14:00:00",
      "estado": "pendiente",
      "motivo": "Chequeo general"
    },
    "paciente": {
      "id": "uuid",
      "nombre": "Juan",
      "apellido": "Pérez",
      "dni": "12345678",
      "telefono": "+541234567890",
      "grupo_sanguineo": "O+"
    }
  }
}
```

**Si no hay turnos:**
```json
{
  "success": true,
  "data": null,
  "message": "No hay turnos pendientes"
}
```

---

#### GET /turnos/fecha
**Requerido: Autenticación**

Obtiene turnos de una fecha específica.

**Query Parameters:**
- `fecha` (requerido): YYYY-MM-DD

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fecha_hora": "2024-01-20T14:00:00",
      "estado": "pendiente",
      "motivo": "Chequeo",
      "paciente": {
        "id": "uuid",
        "nombre": "Juan",
        "apellido": "Pérez"
      },
      "medico": {
        "nombre": "Dr. García",
        "apellido": "López"
      }
    }
  ]
}
```

---

#### POST /turnos
**Requerido: Autenticación (Secretaria/Admin)**

Crea un nuevo turno.

```json
{
  "paciente_id": "uuid",
  "medico_id": "uuid",
  "fecha_hora": "2024-01-20T14:00:00",
  "motivo": "Chequeo general"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Turno creado exitosamente",
  "data": {
    "id": "uuid",
    "fecha_hora": "2024-01-20T14:00:00",
    "estado": "pendiente"
  }
}
```

---

#### GET /turnos/:id
**Requerido: Autenticación**

Obtiene detalle de un turno.

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fecha_hora": "2024-01-20T14:00:00",
    "estado": "pendiente",
    "motivo": "Chequeo",
    "paciente": {
      "id": "uuid",
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "medico": {
      "nombre": "Dr. García",
      "apellido": "López"
    }
  }
}
```

---

#### PATCH /turnos/:id/estado
**Requerido: Autenticación**

Cambia el estado de un turno.

```json
{
  "estado": "confirmado"
}
```

**Estados válidos:** `pendiente`, `confirmado`, `en_consulta`, `atendido`, `cancelado`, `no_asistio`

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Turno actualizado"
}
```

---

#### PATCH /turnos/:id/iniciar
**Requerido: Autenticación (Doctor)**

Inicia una consulta (cambia a `en_consulta`).

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Consulta iniciada"
}
```

---

#### PATCH /turnos/:id/finalizar
**Requerido: Autenticación (Doctor)**

Finaliza una consulta (cambia a `atendido`).

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Consulta finalizada"
}
```

---

### 📋 HISTORIAS CLÍNICAS

#### POST /historias
**Requerido: Autenticación (Doctor)**

Crea una nueva historia clínica.

```json
{
  "paciente_id": "uuid",
  "peso": 75,
  "talla": 180,
  "diagnostico": "Hipertensión leve",
  "medicamentos": "Losartán 50mg",
  "notas": "Seguimiento en 1 mes"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Historia clínica creada",
  "data": {
    "id": "uuid",
    "imc": 23.1,
    "diagnostico": "Hipertensión leve"
  }
}
```

---

#### GET /historias/:id
**Requerido: Autenticación**

Obtiene una historia clínica específica.

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "paciente_id": "uuid",
    "peso": 75,
    "talla": 180,
    "imc": 23.1,
    "diagnostico": "Hipertensión leve",
    "medicamentos": "Losartán 50mg",
    "notas": "Seguimiento en 1 mes",
    "fecha_creacion": "2024-01-20",
    "estudios_adjuntos": [
      {
        "id": "uuid",
        "tipo_estudio": "Laboratorio",
        "url": "https://..."
      }
    ]
  }
}
```

---

#### PUT /historias/:id
**Requerido: Autenticación (Doctor)**

Actualiza una historia clínica.

```json
{
  "peso": 76,
  "talla": 180,
  "diagnostico": "Hipertensión controlada",
  "medicamentos": "Losartán 100mg"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Historia actualizada",
  "data": {
    "imc": 23.5
  }
}
```

---

#### POST /historias/:historia_id/estudios
**Requerido: Autenticación (Doctor)**

Sube un estudio/archivo adjunto.

**Form Data:**
- `file`: Archivo (imagen, PDF, etc.)
- `tipo_estudio`: "Laboratorio", "Radiografía", "Ecografía", etc.

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Estudio subido",
  "data": {
    "id": "uuid",
    "url": "https://supabase.../estudios/...",
    "tipo_estudio": "Laboratorio"
  }
}
```

---

#### GET /historias/paciente/:paciente_id
**Requerido: Autenticación**

Obtiene todas las historias de un paciente.

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fecha_creacion": "2024-01-20",
      "diagnostico": "Hipertensión leve",
      "imc": 23.1
    }
  ]
}
```

---

### 👤 USUARIOS (Admin Only)

#### GET /usuarios
**Requerido: Autenticación (Admin)**

Lista todos los usuarios.

**Query Parameters:**
- `rol` (opcional): Filtrar por rol

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "admin@lemes.com",
      "nombre": "Administrador",
      "rol": "ROLE_ADMIN",
      "estado": "activo"
    }
  ]
}
```

---

#### POST /usuarios
**Requerido: Autenticación (Admin)**

Crea un nuevo usuario.

```json
{
  "email": "nuevo@lemes.com",
  "password": "Password123",
  "nombre": "Nuevo",
  "apellido": "Usuario",
  "rol": "ROLE_DOCTOR"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Usuario creado",
  "data": {
    "id": "uuid",
    "email": "nuevo@lemes.com"
  }
}
```

---

#### DELETE /usuarios/:id
**Requerido: Autenticación (Admin)**

Elimina un usuario.

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Usuario eliminado"
}
```

---

### 📄 DOCUMENTOS

#### POST /documentos/:paciente_id
**Requerido: Autenticación (Secretaria/Admin)**

Sube un documento para un paciente.

**Form Data:**
- `file`: Archivo PDF, imagen, etc.
- `tipo_documento`: "Certificado", "Receta", "Informe", etc.

**Respuesta (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://supabase.../documentos/...",
    "tipo_documento": "Certificado"
  }
}
```

---

#### GET /documentos/paciente/:paciente_id
**Requerido: Autenticación**

Lista documentos de un paciente.

**Respuesta (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tipo_documento": "Certificado",
      "url": "https://...",
      "fecha_creacion": "2024-01-20"
    }
  ]
}
```

---

#### DELETE /documentos/:id
**Requerido: Autenticación (Secretaria/Admin)**

Elimina un documento.

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Documento eliminado"
}
```

---

## Códigos de Error

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 201 | Recurso creado |
| 400 | Datos inválidos |
| 401 | No autenticado |
| 403 | No autorizado (rol insuficiente) |
| 404 | Recurso no encontrado |
| 409 | Conflicto (DNI duplicado, etc.) |
| 500 | Error del servidor |

---

## Headers Recomendados

```
Authorization: Bearer {sessionToken}
Content-Type: application/json
```

---

## Ejemplo de Flujo Completo

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lemes.com","password":"password123"}'

# Respuesta incluye: sessionToken

# 2. Usar token en siguiente request
curl -X GET http://localhost:3000/api/pacientes \
  -H "Authorization: Bearer {sessionToken}"

# 3. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer {sessionToken}"
```

---

## Rate Limiting

Próximamente: Limitación de 100 requests por minuto por usuario.

---

**Última actualización:** 2024-01-20
**Versión API:** v1.0
