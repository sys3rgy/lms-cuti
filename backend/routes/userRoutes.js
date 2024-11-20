const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController"); // General user data functions
const authMiddleware = require("../middlewares/authMiddleware");

// Route to get all users (admin-only functionality)
router.get(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["admin"]),
  userController.getUsers
);

// Route to get the authenticated user's profile
router.get(
  "/me",
  authMiddleware.verifyToken,
  userController.getMe
);

// Route to get a specific user by ID
router.get(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["admin", "manager"]),
  userController.getUserById
);

// Route to create a new user
router.post(
  "/create",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["admin"]),
  userController.createUser
);

// Route to update an existing user
router.put(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["admin"]),
  userController.updateUser
);

// Route to delete a user
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["admin"]),
  userController.deleteUser
);

module.exports = router;
