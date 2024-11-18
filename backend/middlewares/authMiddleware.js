const jwt = require("jsonwebtoken");
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

// Verify token and extract user info
authMiddleware.verifyToken = (req, res, next) => {
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
    const decoded = verifyJwtToken(token);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
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
