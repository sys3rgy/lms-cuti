const express = require("express");
const router = express.Router();
const approverController = require("../controllers/approverController");
const authMiddleware = require("../middlewares/authMiddleware");

// Routes for approvers management

// Create a new approver
router.post(
  "/",
  authMiddleware.verifyToken, // Validate the token and attach user info
  authMiddleware.checkRole(["admin", "manager"]), // Only admins or managers can create approvers
  approverController.createApprover
);

// Get all approvers for a specific target (e.g., department or user)
router.get(
  "/",
  authMiddleware.verifyToken, // Validate the token
  authMiddleware.checkRole(["admin", "manager"]), // Admins or managers can fetch approvers
  approverController.getApprovers
);

// Get a specific approver by ID
router.get(
  "/:id",
  authMiddleware.verifyToken, // Validate the token
  authMiddleware.checkRole(["admin", "manager"]), // Admins or managers can fetch approvers
  approverController.getApproverById
);

// Update an existing approver
router.put(
  "/:id",
  authMiddleware.verifyToken, // Validate the token
  authMiddleware.checkRole(["admin", "manager"]), // Only admins or managers can update approvers
  approverController.updateApprover
);

// Delete an approver
router.delete(
  "/:id",
  authMiddleware.verifyToken, // Validate the token
  authMiddleware.checkRole(["admin", "manager"]), // Only admins or managers can delete approvers
  approverController.deleteApprover
);

module.exports = router;
