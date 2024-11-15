// app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Base route for testing
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Import routes
const authRoutes = require('./routes/authRoutes');           // Authentication routes
const superAdminRoutes = require('./routes/superAdminRoutes'); // SuperAdmin routes
const userRoutes = require('./routes/userRoutes');           // User data routes

// Mount the routes
// Authentication routes (e.g., /api/auth/login, /api/auth/superadmin/login)
app.use('/api/auth', authRoutes);

// SuperAdmin-specific routes (e.g., /api/superadmin/admin-data)
app.use('/api/superadmin', superAdminRoutes);

// User data routes (e.g., /api/users)
app.use('/api', userRoutes);

// Export app module for server or testing
module.exports = app;
