const db = require('../config/db');

class UsuarioModel {
    // Buscar un usuario por su correo electrónico
    static async buscarPorEmail(email) {
        const [filas] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        return filas[0];
    }

    // Buscar un usuario por su ID único
    static async buscarPorId(id) {
        const [filas] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        return filas[0];
    }

    // Registrar un nuevo usuario en la base de datos
    static async crear(datos) {
        const { identificacion, nombre, telefono, direccion, email, password } = datos;
        const consulta = `
            INSERT INTO usuarios (identificacion, nombre, telefono, direccion, email, password) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [resultado] = await db.query(consulta, [identificacion, nombre, telefono, direccion, email, password]);
        return resultado.insertId;
    }

    // Actualizar el perfil del usuario (Nota: La identificación NO se modifica por reglas del negocio)
    static async actualizarPerfil(id, datos) {
        const { nombre, telefono, direccion, email } = datos;
        const consulta = `
            UPDATE usuarios 
            SET nombre = ?, telefono = ?, direccion = ?, email = ? 
            WHERE id = ?
        `;
        await db.query(consulta, [nombre, telefono, direccion, email, id]);
    }
}

module.exports = UsuarioModel;