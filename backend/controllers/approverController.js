const db = require("../config/database"); // Ensure the database connection is correct

const approverController = {};

// Validate Target Existence
const validateTargetExistence = async (target_type, target_id) => {
  let query = "";
  switch (target_type) {
    case "department":
      query = "SELECT id FROM departments WHERE id = $1";
      break;
    case "user":
      query = "SELECT id FROM users WHERE id = $1";
      break;
    default:
      return false;
  }

  const result = await db.query(query, [target_id]);
  return result.rows.length > 0;
};

// Create a new approver
approverController.createApprover = async (req, res) => {
  const { approver_id, is_backup, target_type, target_id } = req.body;

  try {
    // Validation: Check if the target_type is valid
    if (!["department", "user"].includes(target_type)) {
      return res.status(400).json({ message: "Invalid target type" });
    }

    // **Added** Validation: Check if the target_id exists
    const targetExists = await validateTargetExistence(target_type, target_id);
    if (!targetExists) {
      return res
        .status(404)
        .json({ message: `${target_type} with ID ${target_id} does not exist` });
    }

    // Insert the approver into the database
    const result = await db.query(
      `INSERT INTO approvers (approver_id, is_backup, target_type, target_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [approver_id, is_backup || false, target_type, target_id]
    );

    res.status(201).json({
      message: "Approver created successfully",
      approver: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating approver:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all approvers for a specific target
approverController.getApprovers = async (req, res) => {
  const { target_type, target_id } = req.query;

  try {
    // Validation: Check if the target_type is valid
    if (!["department", "user"].includes(target_type)) {
      return res.status(400).json({ message: "Invalid target type" });
    }

    // **Added** Validation: Check if the target_id exists
    const targetExists = await validateTargetExistence(target_type, target_id);
    if (!targetExists) {
      return res
        .status(404)
        .json({ message: `${target_type} with ID ${target_id} does not exist` });
    }

    // Fetch approvers for the target
    const result = await db.query(
      `SELECT a.id, a.approver_id, u.name AS approver_name, a.is_backup, a.target_type, a.target_id, a.created_at, a.updated_at
       FROM approvers a
       INNER JOIN users u ON a.approver_id = u.id
       WHERE a.target_type = $1 AND a.target_id = $2
       ORDER BY a.created_at DESC`,
      [target_type, target_id]
    );

    res.status(200).json({ approvers: result.rows });
  } catch (error) {
    console.error("Error fetching approvers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a specific approver by ID
approverController.getApproverById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT a.id, a.approver_id, u.name AS approver_name, a.is_backup, a.target_type, a.target_id, a.created_at, a.updated_at
       FROM approvers a
       INNER JOIN users u ON a.approver_id = u.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Approver not found" });
    }

    res.status(200).json({ approver: result.rows[0] });
  } catch (error) {
    console.error("Error fetching approver:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update an existing approver
approverController.updateApprover = async (req, res) => {
  const { id } = req.params;
  const { is_backup } = req.body;

  try {
    const result = await db.query(
      `UPDATE approvers 
       SET is_backup = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [is_backup, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Approver not found" });
    }

    res.status(200).json({
      message: "Approver updated successfully",
      approver: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating approver:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an approver
approverController.deleteApprover = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM approvers WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Approver not found" });
    }

    res.status(200).json({ message: "Approver deleted successfully" });
  } catch (error) {
    console.error("Error deleting approver:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = approverController;
