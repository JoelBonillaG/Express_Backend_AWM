const UserRepository = require('../repositories/UserRepository');
const RefreshTokenRepository = require('../repositories/RefreshTokenRepository');
const AuthService = require('../services/AuthService');
const UserService = require('../services/UserService');

const userRepository = new UserRepository();
const refreshTokenRepository = new RefreshTokenRepository();

const authService = new AuthService(userRepository, refreshTokenRepository);
const userService = new UserService(userRepository);

module.exports = {
  userRepository,
  refreshTokenRepository,
  authService,
  userService
};

