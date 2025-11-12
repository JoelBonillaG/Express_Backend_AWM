const bcrypt = require('bcryptjs');
const UserRepository = require('../repositories/UserRepository');

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getAllUsers(filters = {}, sort = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const users = await this.userRepository.findWithFilters(filters, sort, skip, limit);
    const total = await this.userRepository.count(filters);
    
    return {
      data: users.map(user => user.toJSON()),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  }

  async getUserById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user.toJSON();
  }

  async createUser(userData, requesterRole) {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('El correo electrónico ya existe');
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    if (userData.rol === 'admin' && requesterRole !== 'admin') {
      throw new Error('Solo los administradores pueden crear usuarios administradores');
    }

    const newUser = await this.userRepository.create(userData);
    return newUser.toJSON();
  }

  async updateUser(id, userData, requesterRole, requesterId) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (requesterRole !== 'admin' && parseInt(id) !== requesterId) {
      throw new Error('Solo puedes actualizar tu propio perfil');
    }

    if (userData.role && userData.role !== user.role && requesterRole !== 'admin') {
      throw new Error('Solo los administradores pueden cambiar los roles de usuario');
    }

    if (userData.role === 'admin' && requesterRole !== 'admin') {
      throw new Error('Solo los administradores pueden asignar el rol de administrador');
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const updatedUser = await this.userRepository.update(id, userData);
    return updatedUser.toJSON();
  }

  async deleteUser(id, requesterRole, requesterId) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (parseInt(id) === requesterId) {
      throw new Error('No puedes eliminar tu propia cuenta');
    }

    if (requesterRole !== 'admin') {
      throw new Error('Solo los administradores pueden eliminar usuarios');
    }

    await this.userRepository.delete(id);
    return { message: 'Usuario eliminado exitosamente' };
  }
}

module.exports = UserService;

