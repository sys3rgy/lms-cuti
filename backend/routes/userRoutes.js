// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // General user data functions

// Route to get all users (may require admin access in some cases)
router.get('/users', userController.getUsers);

module.exports = router;
