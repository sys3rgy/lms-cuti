const db = require("../config/database"); // Ensure the path to `database.js` is correct
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

const userController = {};

// Get all users (admin-only functionality)
userController.getUsers = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Database query error" });
  }
};

// Get authenticated user's profile
userController.getMe = async (req, res) => {
  try {
    // Extract user ID from the middleware (set by verifyToken)
    const userId = req.userId;

    // Query the database for the user's profile
    const result = await db.query(
      `SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.company_id, 
                c.name AS company_name, 
                r.name AS role 
            FROM users u
            LEFT JOIN companies c ON u.company_id = c.id
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.id = $1`,
      [userId]
    );

    // Check if the user exists
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user details
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Generate a secure token for password setup
const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Send password setup email
const sendPasswordSetupEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const setupLink = `${process.env.FRONTEND_URL}/set-password?token=${token}`;
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Set Your Password",
    text: `Click the link to set your password: ${setupLink}`,
    html: `<p>Click the link to set your password: <a href="${setupLink}">${setupLink}</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

// Create User
userController.createUser = async (req, res) => {
  const { name, email, department_id, job_title_id } = req.body;

  try {
    // Ensure `companyId` is derived from the logged-in user
    const companyId = req.companyId;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Check if the email is already in use
    const existingUser = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Insert the user into the database
    const result = await db.query(
      `INSERT INTO users (name, email, company_id, department_id, job_title_id, accrued_leaves, leave_amount, start_date, working_schedule, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id`,
      [
        name,
        email,
        companyId,
        department_id || null,
        job_title_id || null,
        false, // Accrued leaves default
        null, // Leave amount will be calculated later
        null, // Start date defaults to NULL
        null, // Working schedule defaults to NULL (company standard schedule)
      ]
    );

    const userId = result.rows[0].id;

    // Generate a unique token for password setup
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expires in 24 hours

    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [userId, token, expiresAt]
    );

    // Send the password setup email
    await sendPasswordSetupEmail(email, token);

    res.status(201).json({ message: "User created successfully and password setup email sent" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Read: Get a specific user by ID
userController.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.company_id, 
        c.name AS company_name, 
        u.department_id, 
        d.name AS department_name, 
        u.job_title_id, 
        j.name AS job_title 
       FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN job_titles j ON u.job_title_id = j.id
       WHERE u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update: Modify user details
userController.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, department_id, job_title_id, start_date } = req.body;

  try {
    const result = await db.query(
      `UPDATE users
       SET 
         name = COALESCE($1, name),
         department_id = COALESCE($2, department_id),
         job_title_id = COALESCE($3, job_title_id),
         start_date = COALESCE($4, start_date),
         updated_at = NOW()
       WHERE id = $5 AND company_id = $6
       RETURNING *`,
      [
        name,
        department_id || null,
        job_title_id || null,
        start_date || null,
        id,
        req.companyId, // Ensure the user belongs to the company making the request
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found or not authorized" });
    }

    res.status(200).json({ message: "User updated successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete: Remove a user
userController.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Delete associated approvers first
    await db.query("DELETE FROM approvers WHERE approver_id = $1", [id]);

    // Delete the user
    const result = await db.query(
      `DELETE FROM users WHERE id = $1 AND company_id = $2 RETURNING *`,
      [id, req.companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found or not authorized" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = userController;
