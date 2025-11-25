const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const UserRepository = require('../repositories/UserRepository');
const RefreshTokenRepository = require('../repositories/RefreshTokenRepository');

class AuthService {
  constructor(userRepository, refreshTokenRepository) {
    this.userRepository = userRepository;
    this.refreshTokenRepository = refreshTokenRepository;
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

    // Generar Access Token y Refresh Token
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);
    
    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: user.toJSON()
    };
  }

  async register(userData) {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Cifrar contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'usuario'
    });

    // Generar tokens
    const accessToken = this.generateAccessToken(newUser);
    const refreshToken = await this.generateRefreshToken(newUser.id);

    return {
      accessToken,
      refreshToken: refreshToken.token,
      user: newUser.toJSON()
    };
  }

  generateAccessToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }

  async generateRefreshToken(userId) {
    // Revocar todos los refresh tokens anteriores del usuario (rotación)
    await this.refreshTokenRepository.revokeAllForUser(userId);
    
    // Crear nuevo refresh token
    return await this.refreshTokenRepository.create(userId, config.jwt.refreshTokenExpiresInDays || 7);
  }

  async refreshAccessToken(refreshTokenString) {
    const refreshToken = await this.refreshTokenRepository.findByToken(refreshTokenString);
    
    if (!refreshToken) {
      throw new Error('Refresh token no encontrado');
    }

    if (!refreshToken.isValid()) {
      throw new Error('Refresh token inválido o expirado');
    }

    // Verificar si el token fue reemplazado (rotación)
    if (refreshToken.replacedBy) {
      throw new Error('Refresh token ha sido revocado (rotación detectada)');
    }

    const user = await this.userRepository.findById(refreshToken.userId);
    
    if (!user || !user.active) {
      throw new Error('Usuario no encontrado o inactivo');
    }

    // Rotación de refresh token: revocar el actual y crear uno nuevo
    const newRefreshToken = await this.generateRefreshToken(user.id);
    await this.refreshTokenRepository.replace(refreshTokenString, newRefreshToken);

    // Generar nuevo access token
    const accessToken = this.generateAccessToken(user);

    return {
      accessToken,
      refreshToken: newRefreshToken.token
    };
  }

  async logout(refreshTokenString) {
    if (refreshTokenString) {
      await this.refreshTokenRepository.revoke(refreshTokenString);
    }
    return true;
  }

  async logoutAll(userId) {
    await this.refreshTokenRepository.revokeAllForUser(userId);
    return true;
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  async verifyRefreshToken(refreshTokenString) {
    const refreshToken = await this.refreshTokenRepository.findByToken(refreshTokenString);
    
    if (!refreshToken || !refreshToken.isValid()) {
      throw new Error('Refresh token inválido o expirado');
    }

    return refreshToken;
  }
}

module.exports = AuthService;

