import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getCollection } from '../config/db.js';

export class UsuarioModel {
  static collection() {
    return getCollection('usuarios');
  }

  /**
   * Buscar usuario por Identificación única
   */
  static async findByIdentificacion(identificacion) {
    return await this.collection().findOne({ identificacion: String(identificacion) });
  }

  /**
   * Buscar usuario por Email
   */
  static async findByEmail(email) {
    return await this.collection().findOne({ email: String(email).toLowerCase() });
  }

  /**
   * Buscar usuario por ObjectId de MongoDB
   */
  static async findById(id) {
    try {
      const objId = typeof id === 'string' ? new ObjectId(id) : id;
      return await this.collection().findOne({ _id: objId });
    } catch {
      return null;
    }
  }

  /**
   * Crear un nuevo usuario / cliente
   */
  static async create(userData) {
    // Hashear la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const doc = {
      identificacion: String(userData.identificacion).trim(),
      nombre: String(userData.nombre).trim(),
      tel: String(userData.tel).trim(),
      dir: String(userData.dir).trim(),
      email: String(userData.email).toLowerCase().trim(),
      password: hashedPassword,
      rol: userData.rol || 'usuario', // 'admin' | 'usuario'
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().insertOne(doc);
    return { _id: result.insertedId, ...doc };
  }

  /**
   * Verificar contraseña con bcrypt
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Actualizar perfil de usuario
   * IMPORTANTE: No cambia ID (identificación es inmutable)
   */
  static async updatePerfil(identificacion, updateData) {
    // Eliminar campos protegidos o inmutables
    const safeData = { ...updateData };
    delete safeData.identificacion;
    delete safeData._id;
    delete safeData.rol; // El rol no se puede auto-escalar
    delete safeData.createdAt;

    if (safeData.password) {
      safeData.password = await bcrypt.hash(safeData.password, 10);
    }
    safeData.updatedAt = new Date();

    const result = await this.collection().findOneAndUpdate(
      { identificacion: String(identificacion) },
      { $set: safeData },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Listar todos los usuarios (para Admin)
   */
  static async findAll() {
    return await this.collection()
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
  }
}
