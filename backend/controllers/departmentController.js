const db = require("../config/database");

const departmentController = {};

// Create Department
departmentController.createDepartment = async (req, res) => {
  const { name, manager_id, leave_amount, accrued_leaves, public_holidays } =
    req.body;

  try {
    // Ensure `companyId` is derived from the logged-in user
    const companyId = req.companyId; // Fix: Use `req.companyId`

    if (!companyId) {
      return res.status(403).json({ message: "Company ID is required" });
    }

    // Insert department into the database
    const result = await db.query(
      `INSERT INTO departments (name, company_id, manager_id, leave_amount, accrued_leaves, public_holidays, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
      [
        name,
        companyId, // Fix: Use `companyId`
        manager_id,
        leave_amount,
        accrued_leaves,
        public_holidays,
      ]
    );

    const department = result.rows[0];

    // Automatically add the department manager as a primary approver
    if (manager_id) {
      await db.query(
        `INSERT INTO approvers (approver_id, is_backup, target_type, target_id, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [manager_id, false, "department", department.id]
      );
    }

    res.status(201).json({
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Fetch all departments for the company
departmentController.getDepartments = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM departments WHERE company_id = $1 ORDER BY created_at DESC`,
      [req.companyId] // Fix: Use `req.companyId`
    );
    res.status(200).json({ departments: result.rows });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch a specific department by ID
departmentController.getDepartmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT * FROM departments WHERE id = $1 AND company_id = $2`,
      [id, req.companyId] // Fix: Use `req.companyId`
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json({ department: result.rows[0] });
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update department details
departmentController.updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, manager_id, leave_amount, accrued_leaves, public_holidays } =
    req.body;

  try {
    const result = await db.query(
      `UPDATE departments 
       SET name = $1, manager_id = $2, leave_amount = $3, accrued_leaves = $4, public_holidays = $5, updated_at = NOW()
       WHERE id = $6 AND company_id = $7
       RETURNING *`,
      [
        name || null,
        manager_id || null,
        leave_amount || null,
        accrued_leaves || false,
        public_holidays || false,
        id,
        req.companyId, // Fix: Use `req.companyId`
      ]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Department not found or not authorized" });
    }

    res.status(200).json({
      message: "Department updated successfully",
      department: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a department
departmentController.deleteDepartment = async (req, res) => {
  const { id } = req.params;

  try {
    // Delete all approvers linked to this department
    await db.query(
      "DELETE FROM approvers WHERE target_type = 'department' AND target_id = $1",
      [id]
    );

    // Delete the department itself
    const result = await db.query(
      `DELETE FROM departments WHERE id = $1 AND company_id = $2 RETURNING *`,
      [id, req.companyId] // Use `req.companyId`
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Department not found or not authorized" });
    }

    res.status(200).json({ message: "Department and associated approvers deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = departmentController;
