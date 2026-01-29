const mysql = require('mysql2/promise');
require('dotenv').config();

// Determine if we should use the remote DB
const isProduction = process.env.RENDER || process.env.NODE_ENV === 'production';

const dbConfig = isProduction ? {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: false,
  },
} : {
  // Local environment defaults
  host: process.env.LOCAL_DB_HOST || 'localhost',
  user: process.env.LOCAL_DB_USER || 'root',
  password: process.env.LOCAL_DB_PASSWORD || 'tsega7659',
  database: process.env.LOCAL_DB_NAME || 'abritech_db',
  port: process.env.LOCAL_DB_PORT || 3306,
};

const pool = mysql.createPool({
  ...dbConfig,
  connectTimeout: 20000,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});


module.exports = pool;
