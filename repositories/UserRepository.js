const User = require('../models/User');
const bcrypt = require('bcryptjs');

class UserRepository {
  constructor() {
    // Preloaded users in memory
    this.users = [
        new User({
            id: 1,
            nombre: 'Sofía Morales',
            email: 'sofia.morales@empresa.com',
            password: bcrypt.hashSync('adminSecure!2024', 10),
            rol: 'admin'
          }),
          new User({
            id: 2,
            nombre: 'Carlos Herrera',
            email: 'carlos.herrera@empresa.com',
            password: bcrypt.hashSync('userPass123', 10),
            rol: 'usuario'
          }),
          new User({
            id: 3,
            nombre: 'Valentina Rojas',
            email: 'valentina.rojas@empresa.com',
            password: bcrypt.hashSync('userPass456', 10),
            rol: 'usuario'
          }),
    ];
    this.nextId = 4;
  }

  async findAll() {
    return [...this.users];
  }

  async findById(id) {
    return this.users.find(user => user.id === parseInt(id));
  }

  async findByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  async create(userData) {
    const newUser = new User({
      id: this.nextId++,
      ...userData,
      fechaCreacion: new Date()
    });
    this.users.push(newUser);
    return newUser;
  }

  async update(id, userData) {
    const index = this.users.findIndex(user => user.id === parseInt(id));
    if (index === -1) return null;
    
    this.users[index] = {
      ...this.users[index],
      ...userData
    };
    return this.users[index];
  }

  async delete(id) {
    const index = this.users.findIndex(user => user.id === parseInt(id));
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    return true;
  }

  async count(filters = {}) {
    let filteredUsers = [...this.users];
    
    if (filters.rol) {
      filteredUsers = filteredUsers.filter(u => u.rol === filters.rol);
    }
    if (filters.nombre) {
      const nombreLower = filters.nombre.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.nombre.toLowerCase().includes(nombreLower)
      );
    }
    if (filters.email) {
      const emailLower = filters.email.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.email.toLowerCase().includes(emailLower)
      );
    }
    if (filters.activo !== undefined) {
      filteredUsers = filteredUsers.filter(u => u.activo === filters.activo);
    }
    
    return filteredUsers.length;
  }

  async findWithFilters(filters = {}, sort = {}, skip = 0, limit = 10) {
    let filteredUsers = [...this.users];
    
    // Apply filters
    if (filters.rol) {
      filteredUsers = filteredUsers.filter(u => u.rol === filters.rol);
    }
    if (filters.nombre) {
      const nombreLower = filters.nombre.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.nombre.toLowerCase().includes(nombreLower)
      );
    }
    if (filters.email) {
      const emailLower = filters.email.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.email.toLowerCase().includes(emailLower)
      );
    }
    if (filters.activo !== undefined) {
      filteredUsers = filteredUsers.filter(u => u.activo === filters.activo);
    }
    
    // Apply sorting
    if (sort.field) {
      filteredUsers.sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sort.order === 'desc' ? -comparison : comparison;
      });
    }
    
    // Apply pagination
    return filteredUsers.slice(skip, skip + limit);
  }
}

module.exports = UserRepository;

