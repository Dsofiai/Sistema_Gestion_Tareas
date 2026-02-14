# Sistema de Gestión de Tareas (SGT)

## Descripción

SGT es una aplicación backend RESTful que permite a usuarios autenticados gestionar sus tareas personales.  
Incluye autenticación mediante JWT, autorización basada en ownership y persistencia en SQLite utilizando Sequelize ORM.

---

## Tecnologías Utilizadas

### Backend
- Node.js
- Express
- Sequelize ORM
- SQLite
- JWT (jsonwebtoken)
- bcrypt (hash de contraseñas)

### Frontend
- HTML
- CSS
- JavaScript (Fetch API)

---

## Arquitectura

El sistema sigue un modelo Cliente-Servidor basado en REST.

- Autenticación stateless con JWT.
- Autorización basada en `userId`.
- Relación 1:N entre Users y Tasks.
- Persistencia mediante SQLite (`database.sqlite`).

---

## Modelo de Base de Datos

### Users
- id (PK)
- username (unique)
- email
- password (hash bcrypt)
- createdAt
- updatedAt

### Tasks
- id (PK)
- userId (FK → Users.id)
- title
- description
- status (pendiente | en_progreso | completada)
- dueDate
- createdAt
- updatedAt

Relación:  
Un usuario puede tener múltiples tareas (1:N).

---

## Instalación y Ejecución

### 1. Clonar o descargar el proyecto

### 2. Instalar dependencias

```bash
npm install
### 3. Ejecutar el servidor

En la carpeta raíz del proyecto, ejecutar:

```bash
node index.js
```

El servidor iniciará en:

```
http://localhost:3000
```

La base de datos SQLite (`database.sqlite`) se creará automáticamente si no existe.

---

## Frontend

El frontend está implementado en un único archivo:

```
index.html
```

### Cómo ejecutarlo

Existen dos opciones:

**Opción 1 (rápida):**
- Abrir `index.html` directamente en el navegador (doble clic).

**Opción 2 (recomendada):**
- Usar la extensión "Live Server" en VS Code.
- Clic derecho en `index.html` → "Open with Live Server".

El frontend permite:

- Registro de usuario
- Inicio de sesión
- Creación de tareas
- Listado de tareas
- Edición de tareas
- Eliminación de tareas
- Cierre de sesión

El token JWT se almacena en `localStorage`.

---

## Endpoints Principales

### Autenticación

- `POST /auth/register`
- `POST /auth/login`

### Tareas (requieren autenticación)

- `POST /tareas`
- `GET /tareas`
- `GET /tareas/:id`
- `PUT /tareas/:id`
- `DELETE /tareas/:id`

Todas las rutas de tareas requieren el header:

```
Authorization: Bearer <token>
```

---

## Seguridad

- Las contraseñas se almacenan utilizando hash bcrypt.
- La autenticación se realiza mediante JWT firmado.
- La autorización se basa en ownership (`userId`).
- Todas las consultas a tareas incluyen filtrado por el usuario autenticado.

---

## Escalabilidad

En caso de requerir soporte para miles de usuarios activos:

- Migración de SQLite a PostgreSQL o MySQL.
- Indexación del campo `tasks.userId`.
- Escalabilidad horizontal gracias a arquitectura stateless.
- Posible implementación de cache y rate limiting.

---

## Decisiones de Diseño

- Se priorizó una arquitectura clara y mantenible.
- Separación de responsabilidades entre autenticación, middleware y lógica de negocio.
- Modelo relacional simple (1:N) para facilitar autorización.
- Diseño preparado para evolución futura.

---

## Autor
@Danna Sofia Imbachi
Desarrollado como prueba técnica para evaluación.
