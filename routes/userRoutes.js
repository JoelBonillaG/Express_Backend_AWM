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

router.get(
  '/',
  authenticate,
  validateGetUsers,
  userController.getAllUsers.bind(userController)
);

router.get(
  '/:id',
  authenticate,
  validateGetUserById,
  userController.getUserById.bind(userController)
);

router.post(
  '/',
  authenticate,
  validateCreateUser,
  userController.createUser.bind(userController)
);

router.put(
  '/:id',
  authenticate,
  validateUpdateUser,
  userController.updateUser.bind(userController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validateDeleteUser,
  userController.deleteUser.bind(userController)
);

module.exports = router;

