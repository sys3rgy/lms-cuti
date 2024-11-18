const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Initialize app
const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Base route for testing
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Import routes
const authRoutes = require("./routes/authRoutes"); // Authentication routes
const superAdminRoutes = require("./routes/superAdminRoutes"); // SuperAdmin routes
const userRoutes = require("./routes/userRoutes"); // User data routes
const policiesRoutes = require("./routes/policiesRoutes"); // Policies routes

// Mount routes under `/api`
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/superadmin", superAdminRoutes); // SuperAdmin-specific routes
app.use("/api/users", userRoutes); // User management routes
app.use("/api/policies", policiesRoutes); // Policies-related routes

// Catch-all for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

// Export app module for server or testing
module.exports = app;
