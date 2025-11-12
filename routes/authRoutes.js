const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { validateLogin } = require('../validators/authValidators');

router.post('/login', validateLogin, authController.login.bind(authController));

module.exports = router;

