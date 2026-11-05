import bcrypt from 'bcryptjs';
import { getDB } from '../config/db.js';

// Rol: Usuario / Cliente
// - Administrar perfil (No cambia ID)
// - Ver historial prestamos
// - Ver Compras

// 1. Ver mi perfil
export const obtenerPerfil = async (req, res) => {
  try {
    const db = getDB();
    const usuario = await db.collection('usuarios').findOne(
      { identificacion: req.user.identificacion },
      { projection: { password: 0 } }
    );
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Administrar perfil (Regla de negocio: No cambia ID)
export const actualizarPerfil = async (req, res) => {
  try {
    const db = getDB();
    const datos = { ...req.body };

    // Protección estricta: No cambiar ID
    delete datos.identificacion;
    delete datos._id;
    delete datos.rol;

    if (datos.password) {
      datos.password = await bcrypt.hash(datos.password, 10);
    }

    await db.collection('usuarios').updateOne(
      { identificacion: req.user.identificacion },
      { $set: datos }
    );

    res.status(200).json({ mensaje: 'Perfil actualizado correctamente (Identificación se mantiene intacta)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Ver historial de préstamos propios
export const verHistorialPrestamos = async (req, res) => {
  try {
    const db = getDB();
    const misPrestamos = await db.collection('prestamos').find({
      'usuario.identificacion': req.user.identificacion
    }).toArray();

    res.status(200).json(misPrestamos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Ver historial de compras (ventas) propias
export const verHistorialCompras = async (req, res) => {
  try {
    const db = getDB();
    const misCompras = await db.collection('ventas').find({
      'cliente.identificacion': req.user.identificacion
    }).toArray();

    res.status(200).json(misCompras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
