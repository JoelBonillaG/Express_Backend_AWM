const UserRepository = require('../repositories/UserRepository');
const AuthService = require('../services/AuthService');
const UserService = require('../services/UserService');

const userRepository = new UserRepository();

const authService = new AuthService(userRepository);
const userService = new UserService(userRepository);

module.exports = {
  userRepository,
  authService,
  userService
};

