// routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Regular user login
router.post('/login', authController.login);

// SuperAdmin-specific login
router.post('/superadmin-login', authController.superAdminLogin);

module.exports = router;
