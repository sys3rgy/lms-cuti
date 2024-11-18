const db = require("../config/database");
const Approver = require("../models/approver");

const fetchPolicies = async (req, res) => {
  const { user_id } = req.query;

  try {
    // Employee Level Policies
    const employeePolicy = await db.query(
      `SELECT leave_amount, accrued_leaves, public_holidays 
       FROM users WHERE id = $1`,
      [user_id]
    );

    // Job Title Level Policies
    const jobTitlePolicy = await db.query(
      `SELECT jt.leave_amount, jt.accrued_leaves, jt.public_holidays 
       FROM job_titles jt
       INNER JOIN users u ON u.job_title_id = jt.id
       WHERE u.id = $1`,
      [user_id]
    );

    // Department Level Policies
    const departmentPolicy = await db.query(
      `SELECT d.leave_amount, d.accrued_leaves, d.public_holidays 
       FROM departments d
       INNER JOIN users u ON u.department_id = d.id
       WHERE u.id = $1`,
      [user_id]
    );

    // Company Level Policies
    const companyPolicy = await db.query(
      `SELECT c.id AS company_id
       FROM companies c
       INNER JOIN users u ON u.company_id = c.id
       WHERE u.id = $1`,
      [user_id]
    );

    // Final Policy Response
    res.status(200).json({
      policies: {
        employee: employeePolicy.rows[0] || null,
        job_title: jobTitlePolicy.rows[0] || null,
        department: departmentPolicy.rows[0] || null,
        company: companyPolicy.rows[0] || null,
      },
    });
  } catch (error) {
    console.error("Error fetching policies:", error);
    res.status(500).json({ error: "Failed to fetch policies" });
  }
};

module.exports = { fetchPolicies };
