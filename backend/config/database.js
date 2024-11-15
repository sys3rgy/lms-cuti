// database.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,  // Allows SSL connection without strict certificate validation
    }
});

// Connection event handlers
pool.on('connect', () => {
    console.log('Connected to the Supabase PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Database connection error:', err);
});

// Test the connection
const testConnection = async () => {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('Connection test succeeded at:', result.rows[0].now);
    } catch (err) {
        console.error('Connection test failed:', err);
    }
};

testConnection();

module.exports = {
    query: (text, params) => pool.query(text, params),
};
