// controllers/userController.js

const db = require('../config/database'); // Adjust the path to `database.js`

async function getUsers(req, res) {
    try {
        const result = await db.query('SELECT * FROM users');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Database query error' });
    }
}

module.exports = { getUsers };
