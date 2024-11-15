// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
require('dotenv').config();

const authController = {};

// Generate JWT token
authController.generateToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Login function for regular users
authController.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) return res.status(404).json({ message: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) return res.status(401).json({ message: 'Invalid password' });

        const token = authController.generateToken(user.rows[0]);
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// SuperAdmin-specific login
authController.superAdminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) return res.status(404).json({ message: 'User not found' });

        // Check if the user has the "SuperAdmin" role
        if (user.rows[0].role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Access denied: Not a SuperAdmin' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) return res.status(401).json({ message: 'Invalid password' });

        const token = authController.generateToken(user.rows[0]);
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = authController;
