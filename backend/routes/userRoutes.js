// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController"); // General user data functions
const authMiddleware = require("../middlewares/authMiddleware");

// Route to get all users (may require admin access in some cases)
router.get("/users", userController.getUsers);

// Route to get the authenticated user's profile
router.get("/me", authMiddleware.verifyToken, userController.getMe);

module.exports = router;
