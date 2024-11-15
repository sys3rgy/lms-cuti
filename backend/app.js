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

module.exports = app;

// Import the authentication routes module
const authRoutes = require('./routes/authRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');

// Mount the authentication routes at the '/api/auth' path
// This means all routes defined in 'authRoutes' will be prefixed with '/api/auth'
// For example, '/login' in authRoutes will be accessible as '/api/auth/login'
app.use('/api/auth', authRoutes);

// Register the superAdminRoutes at '/api/superadmin'
app.use('/api/superadmin', superAdminRoutes);