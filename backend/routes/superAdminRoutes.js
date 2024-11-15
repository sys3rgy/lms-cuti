// routes/superAdminRoutes.js
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Example of a protected SuperAdmin-only route
router.get('/manage-users', 
    authMiddleware.verifyToken, 
    authMiddleware.checkRole(['SuperAdmin']), 
    (req, res) => {
        res.status(200).json({ message: 'SuperAdmin managing users' });
    }
);

// Another example for managing companies
router.get('/manage-companies', 
    authMiddleware.verifyToken, 
    authMiddleware.checkRole(['SuperAdmin']), 
    (req, res) => {
        res.status(200).json({ message: 'SuperAdmin managing companies' });
    }
);

module.exports = router;
