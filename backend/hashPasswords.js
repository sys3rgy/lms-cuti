const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function hashAndStorePasswords() {
  try {
    const users = [
      { id: 1, password: "abc123" },
      { id: 2, password: "abc123" },
      { id: 3, password: "abc123" },
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
        hashedPassword,
        user.id,
      ]);
    }

    console.log("Passwords hashed and updated successfully.");
  } catch (error) {
    console.error("Error hashing passwords:", error);
  } finally {
    await pool.end();
  }
}

hashAndStorePasswords();

// Note to self: This was made when I was doing testing on the login and backend integration. I tried to login with bob/alice@example.com with password 'abc123'.
// We configured it where we need to login when it is already hashed via bcrypt.js. This script is to hash them.
