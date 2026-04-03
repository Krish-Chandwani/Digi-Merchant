const AuthController = require('../controller/auth.controller');
const {validateRequest} = require('../validators/validateRequest');
const {loginValidation, registerValidation} = require('../validators/authValidator');
const express = require('express');
const router = express.Router();

router.post('/register',registerValidation,validateRequest, AuthController.register);
router.post('/login', loginValidation,validateRequest, AuthController.login);

module.exports = router;