const express = require("express");
const router = express.Router();
const policiesController = require("../controllers/policiesController");

// Route to fetch policies
router.get("/", policiesController.fetchPolicies);

module.exports = router;
