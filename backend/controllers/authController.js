const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/database");
require("dotenv").config();

const authController = {};

// Generate JWT token
authController.generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Login function
authController.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const userResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Get user role
    const roleResult = await db.query(
      "SELECT r.name AS role FROM roles r INNER JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = $1",
      [user.id]
    );
    const role = roleResult.rows[0]?.role || "Employee"; // Default to "Employee" if no role is found

    // Generate token
    const token = authController.generateToken({ id: user.id, role });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// SuperAdmin login function
authController.superAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const userResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    // Get user role
    const roleResult = await db.query(
      "SELECT r.name AS role FROM roles r INNER JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = $1",
      [user.id]
    );
    const role = roleResult.rows[0]?.role;

    if (role !== "SuperAdmin") {
      return res
        .status(403)
        .json({ message: "Access denied: Not a SuperAdmin" });
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate token
    const token = authController.generateToken({
      id: user.id,
      role: "SuperAdmin",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error("SuperAdmin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Register function
authController.register = async (req, res) => {
  const { companyName, name, email, password } = req.body;

  if (!password || !email || !name || !companyName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Check if company already exists
    const existingCompany = await db.query(
      "SELECT * FROM companies WHERE name = $1",
      [companyName]
    );
    if (existingCompany.rows.length > 0) {
      return res.status(400).json({ message: "Company name already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new company into the database
    const newCompany = await db.query(
      "INSERT INTO companies (name, subscription_plan, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id",
      [companyName, "Free"]
    );
    const companyId = newCompany.rows[0].id;

    // Insert new user into the database as Company Admin
    const newUser = await db.query(
      "INSERT INTO users (name, email, password, company_id, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id",
      [name, email, hashedPassword, companyId]
    );
    const userId = newUser.rows[0].id;

    // Update the company's admin ID with the new user's ID
    await db.query("UPDATE companies SET company_admin_id = $1 WHERE id = $2", [
      userId,
      companyId,
    ]);

    // Assign the "Admin" role to the new user
    const roleResult = await db.query("SELECT id FROM roles WHERE name = $1", [
      "admin",
    ]);
    if (roleResult.rows.length === 0) {
      throw new Error("Admin role not found in the roles table");
    }
    const adminRoleId = roleResult.rows[0].id;

    await db.query(
      "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
      [userId, adminRoleId]
    );

    // Generate JWT token
    const token = authController.generateToken({ id: userId, role: "Admin" });

    res.status(201).json({
      token,
      message: "User registered successfully as Company Admin",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = authController;
