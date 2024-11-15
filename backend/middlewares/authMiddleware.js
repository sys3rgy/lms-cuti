const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = {};

// Verify token and extract user info
authMiddleware.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });

        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

// Role-based authorization
authMiddleware.checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.userRole)) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};

module.exports = authMiddleware;
