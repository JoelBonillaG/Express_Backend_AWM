const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  validateGetUsers,
  validateGetUserById,
  validateCreateUser,
  validateUpdateUser,
  validateDeleteUser
} = require('../validators/userValidators');

// GET /users - Get all users with pagination, filters, and sorting
router.get(
  '/',
  authenticate,
  validateGetUsers,
  userController.getAllUsers.bind(userController)
);

// GET /users/:id - Get user by ID
router.get(
  '/:id',
  authenticate,
  validateGetUserById,
  userController.getUserById.bind(userController)
);

// POST /users - Create new user
router.post(
  '/',
  authenticate,
  validateCreateUser,
  userController.createUser.bind(userController)
);

// PUT /users/:id - Update user
router.put(
  '/:id',
  authenticate,
  validateUpdateUser,
  userController.updateUser.bind(userController)
);

// DELETE /users/:id - Delete user (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validateDeleteUser,
  userController.deleteUser.bind(userController)
);

module.exports = router;

