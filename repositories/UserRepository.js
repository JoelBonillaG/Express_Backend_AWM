const User = require('../models/User');
const bcrypt = require('bcryptjs');

class UserRepository {
  constructor() {
    this.users = [
        new User({
            id: 1,
            name: 'Sofía Morales',
            email: 'sofia.morales@empresa.com',
            password: bcrypt.hashSync('adminSecure!2024', 10),
            role: 'admin'
          }),
          new User({
            id: 2,
            name: 'Carlos Herrera',
            email: 'carlos.herrera@empresa.com',
            password: bcrypt.hashSync('userPass123', 10),
            role: 'usuario'
          }),
          new User({
            id: 3,
            name: 'Valentina Rojas',
            email: 'valentina.rojas@empresa.com',
            password: bcrypt.hashSync('userPass456', 10),
            role: 'usuario'
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
      createdAt: new Date()
    });
    this.users.push(newUser);
    return newUser;
  }

  async update(id, userData) {
    const index = this.users.findIndex(user => user.id === parseInt(id));
    if (index === -1) return null;
    
    const existingUser = this.users[index];
    const updatedUser = new User({
      ...existingUser,
      ...userData
    });
    
    this.users[index] = updatedUser;
    return updatedUser;
  }

  async delete(id) {
    const index = this.users.findIndex(user => user.id === parseInt(id));
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    return true;
  }

  async count(filters = {}) {
    let filteredUsers = [...this.users];
    
    if (filters.role) {
      filteredUsers = filteredUsers.filter(u => u.role === filters.role);
    }
    if (filters.name) {
      const nameLower = filters.name.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(nameLower)
      );
    }
    if (filters.email) {
      const emailLower = filters.email.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.email.toLowerCase().includes(emailLower)
      );
    }
    if (filters.active !== undefined) {
      filteredUsers = filteredUsers.filter(u => u.active === filters.active);
    }
    
    return filteredUsers.length;
  }

  async findWithFilters(filters = {}, sort = {}, skip = 0, limit = 10) {
    let filteredUsers = [...this.users];
    
    if (filters.role) {
      filteredUsers = filteredUsers.filter(u => u.role === filters.role);
    }
    if (filters.name) {
      const nameLower = filters.name.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(nameLower)
      );
    }
    if (filters.email) {
      const emailLower = filters.email.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.email.toLowerCase().includes(emailLower)
      );
    }
    if (filters.active !== undefined) {
      filteredUsers = filteredUsers.filter(u => u.active === filters.active);
    }
    
    if (sort.field) {
      filteredUsers.sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sort.order === 'desc' ? -comparison : comparison;
      });
    }
    
    return filteredUsers.slice(skip, skip + limit);
  }
}

module.exports = UserRepository;

