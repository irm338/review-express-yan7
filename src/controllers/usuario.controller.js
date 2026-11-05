import bcrypt from 'bcryptjs';
import { getDB } from '../config/db.js';

// ============================================================================
// Rol: Usuario / Cliente
// Requerimientos:
// - Administrar perfil (No cambia ID)
// - Ver historial préstamos
// - Ver Compras
// ============================================================================

// 1. Ver Perfil del usuario autenticado
export const obtenerPerfil = async (req, res) => {
  try {
    const db = getDB();
    const usuario = await db.collection('usuarios').findOne(
      { identificacion: req.user.identificacion },
      { projection: { password: 0 } } // No retornar la contraseña
    );
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Administrar Perfil
// REGLA CRÍTICA EXIGIDA: "No cambia ID"
export const actualizarPerfil = async (req, res) => {
  try {
    const db = getDB();
    const camposPermitidos = { ...req.body };

    // Protección estricta: No se permite cambiar identificacion ni _id
    delete camposPermitidos.identificacion;
    delete camposPermitidos._id;
    delete camposPermitidos.rol; // El usuario no puede auto-cambiarse el rol

    // Si envía nueva contraseña, se hashea con bcrypt
    if (camposPermitidos.password) {
      camposPermitidos.password = await bcrypt.hash(camposPermitidos.password, 10);
    }

    await db.collection('usuarios').updateOne(
      { identificacion: req.user.identificacion },
      { $set: camposPermitidos }
    );

    res.status(200).json({
      mensaje: 'Perfil actualizado correctamente (La identificación se conservó sin cambios)'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Ver Historial de Préstamos Propios
export const verHistorialPrestamos = async (req, res) => {
  try {
    const db = getDB();
    // Buscar los préstamos asociados a la identificación del usuario en sesión
    const misPrestamos = await db.collection('prestamos').find({
      'usuario.identificacion': req.user.identificacion
    }).toArray();

    res.status(200).json(misPrestamos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Ver Historial de Compras (Ventas) Propias
export const verHistorialCompras = async (req, res) => {
  try {
    const db = getDB();
    // Buscar las compras asociadas a la identificación del cliente en sesión
    const misCompras = await db.collection('ventas').find({
      'cliente.identificacion': req.user.identificacion
    }).toArray();

    res.status(200).json(misCompras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
