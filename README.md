# 📚 Sistema de Gestión de Biblioteca - API RESTful (Review Express)

Proyecto desarrollado para el **Review de Express.js y NodeJS** en **Campuslands** (Trainer: *Edwin Salas*). Implementa una arquitectura profesional basada en el patrón **MVC (Modelo-Vista-Controlador)**, integrando los 5 módulos formativos del curso junto con los requerimientos funcionales para los roles **Admin** y **Usuario / Cliente**.

---

## 🚀 Tecnologías y Módulos del Curso Implementados

| Módulo | Tema del Curso | Implementación en el Proyecto |
| :--- | :--- | :--- |
| **Módulo 1** | **Fundamentos de NodeJS y Express** | Servidor modular, variables de entorno (`dotenv`), scripts npm (`start`, `dev`, `seed`, `test`), CORS y logging con `morgan`. |
| **Módulo 2** | **Servidor Express y MongoDB** | Conexión Singleton con el driver oficial `mongodb` (`MongoClient`), creación automática de índices y seeder de datos. |
| **Módulo 3** | **Validación de Datos (DTO) y Cookies** | Middleware `validateDTO` para validación y saneamiento de objetos de transferencia, y manejo de cookies seguras `httpOnly` con `cookie-parser`. |
| **Módulo 4** | **Versionado Semántico y Rate Limit** | Middleware de versionado semántico **SemVer** (`Accept-Version`, `x-api-version`, `/api/v1`) y protección contra ataques con `express-rate-limit`. |
| **Módulo 5** | **Arquitectura MVC y Autenticación Passport JWT** | Separación por capas (Modelos, Controladores, Rutas, DTOs, Middlewares), Passport.js con estrategia JWT, hashing con `bcryptjs` y RBAC (Control de Acceso Basado en Roles). |

---

## 📋 Requerimientos Funcionales

### 🛡️ Rol: Administrador (Admin)
1. **Gestión de Libros (CRUD completo):**
   - **Crear libro:** Código/ISBN, título, autor, editorial, categoría, año de publicación, precio de venta, cantidad disponible (stock) y estado.
   - **Listar libros:** Con soporte para paginación y filtros por categoría o disponibilidad.
   - **Buscar libros:** Búsqueda flexible por texto o expresión regular en título, autor, categoría o ISBN.
   - **Editar libro:** Modificación de datos e inventario.
   - **Eliminar libro:** Borrado seguro de libros en el inventario.
2. **Prestar Libros:**
   - Registro de préstamo vinculando: Libro, usuario, fecha de préstamo, fecha tentativa de devolución, fecha de devolución (inicialmente `null`) y estado `PRESTADO`.
   - Control de inventario automático: Al realizar un préstamo se valida que haya stock y se descuenta 1 unidad.
   - Registro de devolución: El admin registra la entrega, guarda la fecha real de devolución, marca el estado en `DEVUELTO` y reintegra automáticamente 1 unidad al stock de inventario.
   - Listar todos los préstamos con filtros y búsqueda por usuario.
3. **Venta de Libros:**
   - Registro de venta a un cliente de **1 o varios libros**.
   - Validación de stock suficiente por cada libro solicitado.
   - Cálculo automático de subtotales por libro y total general de la venta.
   - Descuento automático de inventario para todos los libros involucrados en la venta.
   - Listado de ventas y detalle por ID.

### 👤 Rol: Usuario / Cliente
1. **Registrarse:**
   - Registro con: Identificación, nombre, teléfono, dirección, email y contraseña.
   - Hashing seguro de contraseña con `bcryptjs` (salt rounds: 10).
2. **Iniciar Sesión:**
   - Generación de token JWT y almacenamiento automático en **Cookie segura HttpOnly** (`token`).
3. **Administrar Perfil:**
   - Actualización de datos de contacto (nombre, teléfono, dirección, email, contraseña).
   - **Regla estricta:** ⚠️ **No cambia ID** (la identificación es inmutable y el middleware DTO rechaza cualquier intento de modificación con error 400).
4. **Ver Historial de Préstamos:**
   - Consulta de todos los préstamos propios asociados a la identificación del usuario autenticado.
5. **Ver Historial de Compras (Ventas):**
   - Consulta de todas las ventas/compras propias registradas a nombre del cliente autenticado.

---

## 🌿 Estrategia de Ramas en Git (Git Flow)

Este repositorio fue construido y versionado **rama por rama** conforme a cada módulo y requerimiento:

- `feature/modulo1-servidor-express`: Inicialización del servidor Express, configuración base y middlewares globales.
- `feature/modulo2-mongodb-conexion`: Conexión Singleton a MongoDB, índices y script de seeder.
- `feature/modulo3-dtos-cookies`: Motor de validación DTO y configuración de cookies HTTP seguras con `cookie-parser`.
- `feature/modulo4-versionado-ratelimit`: Versionado SemVer y limitador de peticiones con `express-rate-limit`.
- `feature/modulo5-passport-jwt-auth`: Autenticación con Passport.js, JWT, bcrypt y autorización por roles.
- `feature/admin-gestion-libros`: CRUD completo de libros e inventario para el Administrador.
- `feature/admin-prestamos-libros`: Registro de préstamos, control de inventario y devoluciones para el Administrador.
- `feature/admin-ventas-libros`: Venta de 1 o varios libros, cálculo y descuento de inventario.
- `feature/usuario-cliente-perfil-historial`: Perfil con ID inmutable, historial de préstamos e historial de compras.
- `develop`: Integración de todas las características y suite de pruebas automatizadas.
- `main`: Rama de producción lista para revisión.

---

## 📂 Estructura del Proyecto

```text
review-express-yan7/
├── .env.example
├── .env
├── .gitignore
├── package.json
├── README.md
├── postman_collection.json
├── tests/
│   └── api.test.js
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   ├── env.js
    │   ├── db.js
    │   └── passport.js
    ├── middlewares/
    │   ├── auth.middleware.js
    │   ├── dto.middleware.js
    │   ├── error.middleware.js
    │   ├── rateLimit.middleware.js
    │   └── version.middleware.js
    ├── dtos/
    │   ├── auth.dto.js
    │   ├── libro.dto.js
    │   ├── prestamo.dto.js
    │   ├── venta.dto.js
    │   └── usuario.dto.js
    ├── models/
    │   ├── libro.model.js
    │   ├── prestamo.model.js
    │   ├── venta.model.js
    │   └── usuario.model.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── libro.controller.js
    │   ├── prestamo.controller.js
    │   ├── venta.controller.js
    │   └── usuario.controller.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── libro.routes.js
    │   ├── prestamo.routes.js
    │   ├── venta.routes.js
    │   └── usuario.routes.js
    └── utils/
        ├── cookies.js
        └── seed.js
```

---

## ⚙️ Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/irm338/review-express-yan7.git
cd review-express-yan7
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Cree un archivo `.env` a partir de `.env.example`:
```env
PORT=3000
NODE_ENV=development

# Conexión a MongoDB (Local o MongoDB Atlas)
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=biblioteca_campus

# JWT y Cookies
JWT_SECRET=campuslands_super_secreto_review_jwt_2026
JWT_EXPIRES_IN=24h
COOKIE_SECRET=campuslands_cookie_secret_key_2026

# Rate Limiter
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 4. Sembrar datos de prueba (Seeder)
Ejecute el script de inicialización para poblar usuarios, libros de muestra, préstamos y ventas:
```bash
npm run seed
```

### 5. Iniciar la aplicación
- En modo desarrollo (recarga automática):
  ```bash
  npm run dev
  ```
- En modo producción:
  ```bash
  npm start
  ```

### 6. Ejecutar pruebas unitarias
```bash
npm test
```

---

## 🔑 Credenciales de Prueba (Sembradas en Seeder)

| Rol | Identificación | Correo Electrónico | Contraseña |
| :--- | :--- | :--- | :--- |
| **Admin** | `1001` | `admin@campuslands.com` | `Admin123*` |
| **Usuario / Cliente** | `1002` | `yanehtarias12@gmail.com` | `User123*` |
| **Usuario / Cliente** | `1003` | `carlos@campuslands.com` | `User123*` |

---

## 📮 Colección de Postman

El archivo `postman_collection.json` se encuentra en la raíz del proyecto. Para utilizarlo:
1. Abra Postman.
2. Haga clic en **Import**.
3. Seleccione `postman_collection.json`.
4. Encontrará carpetas organizadas para cada módulo:
   - `0. Health & Semver`
   - `1. Autenticación & Cookies`
   - `2. Admin - Gestión Libros e Inventario`
   - `3. Admin - Préstamos de Libros`
   - `4. Admin - Venta de Libros`
   - `5. Usuario / Cliente - Perfil e Historial`

---

## 👤 Autora
- **Irma Yaneht Arias García**
- GitHub: [@irm338](https://github.com/irm338)
- Email: [yanehtarias12@gmail.com](mailto:yanehtarias12@gmail.com)
- Institución: **Campuslands**
