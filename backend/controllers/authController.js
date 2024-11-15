// controllers/authController.js
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

// Login function for regular users
authController.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword)
      return res.status(401).json({ message: "Invalid password" });

    const token = authController.generateToken(user.rows[0]);
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// SuperAdmin-specific login
authController.superAdminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    // Check if the user has the "SuperAdmin" role
    if (user.rows[0].role !== "SuperAdmin") {
      return res
        .status(403)
        .json({ message: "Access denied: Not a SuperAdmin" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword)
      return res.status(401).json({ message: "Invalid password" });

    const token = authController.generateToken(user.rows[0]);
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Register function
authController.register = async (req, res) => {
  const { companyName, name, email, password } = req.body;

  // Fields Validation
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

    //Confirm whether the password field is being passed correctly from the frontend or curl request.
    console.log("Password received:", password);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new company into the database
    const newCompany = await db.query(
      "INSERT INTO companies (name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id",
      [companyName] // Use default value of subscription_plan in the database (which is 'Free')
    );
    const companyId = newCompany.rows[0].id;

    // Insert new user into the database as Company Admin
    const newUser = await db.query(
      "INSERT INTO users (name, email, password, company_id, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *",
      [name, email, hashedPassword, companyId]
    );

    // Update the company's admin ID with the new user's ID
    await db.query("UPDATE companies SET company_admin_id = $1 WHERE id = $2", [
      newUser.rows[0].id,
      companyId,
    ]);

    // Generate JWT token for the new user
    const token = authController.generateToken(newUser.rows[0]);

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
