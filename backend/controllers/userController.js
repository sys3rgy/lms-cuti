const db = require("../config/database"); // Adjust the path to `database.js`

const userController = {};

// Get all users (admin-only functionality)
userController.getUsers = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Database query error" });
  }
};

// Get authenticated user's profile
userController.getMe = async (req, res) => {
  try {
    // Extract user ID from the middleware (set by verifyToken)
    const userId = req.userId;

    // Query the database for the user's profile
    const result = await db.query(
      `SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.company_id, 
                c.name AS company_name, 
                r.name AS role 
            FROM users u
            LEFT JOIN companies c ON u.company_id = c.id
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.id = $1`,
      [userId]
    );

    // Check if the user exists
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user details
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = userController;
