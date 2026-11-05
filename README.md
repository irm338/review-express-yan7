# 📚 Sistema de Gestión de Biblioteca - Express & NodeJS (Review Campers)

API RESTful desarrollada para el **Review de Express.js y NodeJS** en **Campuslands** (Trainer: *Edwin Salas*).
Construida con una arquitectura limpia, estructurada y con **código sencillo, básico y 100% entendible**, fácil de explicar y sustentar.

---

## 🚀 Temas Vistos en Clase Implementados

| Módulo | Tema del Curso | Dónde se encuentra en el código |
| :--- | :--- | :--- |
| **Módulo 1** | **Fundamentos de NodeJS y Express** | `src/app.js` y `src/server.js` (servidor Express, `express.json()`, CORS, variables `.env`). |
| **Módulo 2** | **Servidor Express y Conexión a MongoDB** | `src/config/db.js` (conexión a MongoDB con `MongoClient` nativo) y `src/utils/seed.js`. |
| **Módulo 3** | **Validación de Datos (DTO) y Cookies** | `src/middlewares/dto.middleware.js` (validaciones con `if` sencillos) y `src/controllers/auth.controller.js` (`res.cookie('token', ...)`). |
| **Módulo 4** | **Versionado Semántico (SemVer) y Rate Limit** | `src/middlewares/version.middleware.js` (valida versión semántica) y `src/middlewares/rateLimit.middleware.js` (`express-rate-limit`). |
| **Módulo 5** | **Arquitectura MVC y Passport JWT** | `src/config/passport.js` (estrategia JWT que lee cookies), `src/middlewares/auth.middleware.js` (autenticación y rol Admin) y carpetas `controllers/` y `routes/`. |

---

## 📋 Requerimientos Funcionales

### 🛡️ Rol: Administrador (Admin)
1. **Gestionar Libros e Inventario:**
   - **Crear:** Guarda libro con `isbn`, `titulo`, `autor`, `editorial`, `categoria`, `anioPublicacion`, `precioVenta` y `cantidadDisponible` (stock).
   - **Listar:** Retorna todos los libros.
   - **Buscar:** Busca por coincidencia flexible en título, autor, categoría o ISBN (`/api/v1/libros/buscar?termino=...`).
   - **Editar:** Actualiza datos del libro o stock.
   - **Eliminar:** Borra el libro por su `_id`.
2. **Prestar Libros:**
   - Registra el préstamo con: `libro`, `fechaPrestamo`, `fechaTentativaDevol`, `fechaDevol: null` y `usuario`.
   - **Control de inventario:** Descuenta automáticamente 1 ejemplar del stock (`cantidadDisponible - 1`).
   - **Devolución:** Actualiza la `fechaDevol` a la fecha actual, cambia el estado a `DEVUELTO` y reintegra 1 ejemplar al inventario (`cantidadDisponible + 1`).
   - **Listar préstamos:** Permite al Admin ver todos los préstamos registrados.
3. **Venta de Libros:**
   - Registra venta a un cliente de **1 o varios libros**.
   - Valida que haya stock suficiente para cada libro pedido.
   - Descuenta del inventario las cantidades vendidas de cada libro.
   - Calcula subtotales y total general.
   - Permite listar todas las ventas.

### 👤 Rol: Usuario / Cliente
1. **Registrarse:** Registro con identificación, nombre, teléfono, dirección, correo y contraseña (encriptada con `bcryptjs`).
2. **Iniciar Sesión:** Genera token JWT y lo guarda automáticamente en una **Cookie segura HttpOnly** (`token`).
3. **Administrar Perfil:**
   - Puede actualizar nombre, teléfono, dirección, correo o contraseña.
   - **Regla estricta:** ⚠️ **No cambia ID** (si intenta modificar la identificación, el middleware DTO rechaza la petición con error 400).
4. **Ver Historial de Préstamos:** Consulta únicamente los préstamos propios de su identificación.
5. **Ver Compras:** Consulta únicamente las compras (ventas) asociadas a su identificación.

---

## 📂 Estructura Limpia del Proyecto (100% Entendible)

```text
review-express-yan7/
├── .env.example              # Variables de entorno de ejemplo
├── .env                      # Variables de entorno activas
├── .gitignore                # Archivos ignorados por git (node_modules, etc.)
├── package.json              # Dependencias y scripts
├── README.md                 # Documentación del proyecto
├── postman_collection.json   # Colección de pruebas para Postman
├── tests/
│   └── api.test.js           # Pruebas unitarias básicas con node:test
└── src/
    ├── app.js                # Configuración de Express, middlewares y rutas
    ├── server.js             # Conexión a la BD y arranque en el puerto 3000
    ├── config/
    │   ├── db.js             # Conexión directa a MongoDB con MongoClient
    │   └── passport.js       # Configuración de Passport JWT y lectura de Cookies
    ├── controllers/
    │   ├── auth.controller.js      # Registrar, Login (con Cookie) y Logout
    │   ├── libro.controller.js     # CRUD de libros e inventario
    │   ├── prestamo.controller.js  # Prestar libro y registrar devolución
    │   ├── venta.controller.js     # Registrar venta (1 o varios libros) y listar
    │   └── usuario.controller.js   # Perfil (No cambia ID), historial préstamos y compras
    ├── middlewares/
    │   ├── auth.middleware.js      # authMiddleware y esAdmin
    │   ├── dto.middleware.js       # Validaciones DTO sencillas (con if)
    │   ├── rateLimit.middleware.js # express-rate-limit (100 peticiones / 15 min)
    │   └── version.middleware.js   # semver (1.0.0)
    ├── routes/
    │   ├── auth.routes.js          # Rutas de autenticación
    │   ├── libro.routes.js         # Rutas de libros
    │   ├── prestamo.routes.js      # Rutas de préstamos
    │   ├── venta.routes.js         # Rutas de ventas
    │   └── usuario.routes.js       # Rutas de usuario / cliente
    └── utils/
        └── seed.js                 # Script para sembrar datos iniciales de prueba
```

---

## ⚙️ Puesta en Marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Sembrar datos de prueba (Crea usuarios y libros iniciales en MongoDB)
npm run seed

# 3. Ejecutar pruebas unitarias
npm test

# 4. Iniciar en modo desarrollo
npm run dev
```

---

## 🔑 Cuentas de Prueba Creadas en el Seeder

* **Administrador:**
  - Correo: `admin@campuslands.com`
  - Contraseña: `Admin123*`
  - Identificación: `1001`
* **Usuario / Cliente:**
  - Correo: `yanehtarias12@gmail.com`
  - Contraseña: `User123*`
  - Identificación: `1002`

---

## 🌿 Ramas en GitHub

El proyecto cuenta con todas las ramas organizadas por módulo y funcionalidad:
- `feature/modulo1-servidor-express`
- `feature/modulo2-mongodb-conexion`
- `feature/modulo3-dtos-cookies`
- `feature/modulo4-versionado-ratelimit`
- `feature/modulo5-passport-jwt-auth`
- `feature/admin-gestion-libros`
- `feature/admin-prestamos-libros`
- `feature/admin-ventas-libros`
- `feature/usuario-cliente-perfil-historial`
- `develop`
- `main`

---
**Autora:** Irma Yaneht Arias García ([@irm338](https://github.com/irm338))  
**Institución:** Campuslands
