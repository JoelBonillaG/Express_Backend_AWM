const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const UserRepository = require('../repositories/UserRepository');

class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.active) {
      throw new Error('La cuenta de usuario está inactiva');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    const token = this.generateToken(user);
    
    return {
      token,
      user: user.toJSON()
    };
  }

  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }
}

module.exports = AuthService;

