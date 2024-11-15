// routes/authRoutes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController"); // Adjust path if needed

// Route for regular user login
router.post("/login", authController.login);

// Route for SuperAdmin login (could be here or in superAdminRoutes)
router.post("/superadmin/login", authController.superAdminLogin);

// Route for Registration
router.post("/register", authController.register);

module.exports = router;
