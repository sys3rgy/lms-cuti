const jwt = require("jsonwebtoken");
const db = require("../config/database"); // Ensure the path to the database config is correct
require("dotenv").config();

const authMiddleware = {};

// Utility function to verify JWT
const verifyJwtToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Token expired");
    }
    if (err.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw new Error("Token verification failed");
  }
};

// Verify token, extract user info, and fetch company_id
authMiddleware.verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Format: "Bearer <token>"
  if (!token) {
    return res
      .status(403)
      .json({ message: "Token missing in authorization header" });
  }

  try {
    // Decode the token
    const decoded = verifyJwtToken(token);
    req.userId = decoded.id;
    req.userRole = decoded.role;

    // Fetch the user's company_id from the database
    const userResult = await db.query(
      "SELECT company_id FROM users WHERE id = $1",
      [req.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    req.companyId = userResult.rows[0].company_id;
    next();
  } catch (error) {
    console.error("Token or company fetch error:", error.message);
    res.status(401).json({ message: error.message });
  }
};

// Role-based authorization middleware
authMiddleware.checkRole = (roles) => (req, res, next) => {
  if (!req.userRole || !roles.includes(req.userRole)) {
    return res
      .status(403)
      .json({ message: "Forbidden: Insufficient role permissions" });
  }
  next();
};

module.exports = authMiddleware;
