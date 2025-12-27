const express = require('express');
const mysql = require('mysql2/promise');  // Use promise-based API
const router = express.Router();

// Create a connection pool (configure with your .env values)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'your_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM user');  // Adjust table name as needed
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;