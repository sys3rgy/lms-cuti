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
