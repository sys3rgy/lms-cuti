const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const authMiddleware = require("../middlewares/authMiddleware");

// Create a new department
router.post(
  "/create",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["admin"]),
  departmentController.createDepartment
);

// Get all departments
router.get(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["admin", "manager"]),
  departmentController.getDepartments
);

// Get a specific department by ID
router.get(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["admin", "manager"]),
  departmentController.getDepartmentById
);

// Update an existing department
router.put(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["admin"]),
  departmentController.updateDepartment
);

// Delete a department
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["admin"]),
  departmentController.deleteDepartment
);

module.exports = router;
