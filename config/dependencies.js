// Dependency Injection Container
// This module manages all dependencies and their instantiation
// Following Dependency Inversion Principle (SOLID)

const UserRepository = require('../repositories/UserRepository');
const AuthService = require('../services/AuthService');
const UserService = require('../services/UserService');

// Create repository instances
const userRepository = new UserRepository();

// Create service instances with injected dependencies
const authService = new AuthService(userRepository);
const userService = new UserService(userRepository);

module.exports = {
  userRepository,
  authService,
  userService
};

