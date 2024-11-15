// routes/superAdminRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware for role checking
const superAdminController = require('../controllers/superAdminController'); // SuperAdmin-specific functions

// Middleware to verify SuperAdmin access
router.use(authMiddleware.verifyToken, authMiddleware.checkRole(['SuperAdmin']));

// Example SuperAdmin-only route
router.get('/admin-data', superAdminController.getAdminData);

module.exports = router;
