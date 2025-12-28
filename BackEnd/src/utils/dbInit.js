// src/utils/dbInit.js
const pool = require('../config/db');
const schema = require('./schema');

let initPromise = null;

/**
 * Ensures that all tables defined in the schema exist in the database.
 * This runs lazily and only once per server lifecycle.
 * It includes retry logic for cloud environments where the DB might be
 * temporarily unavailable during initial requests.
 */
const ensureTablesExist = async (retries = 3, delay = 2000) => {
  // If already initializing or initialized, return the existing promise
  if (initPromise) return initPromise;

  initPromise = (async () => {
    console.log('--- Initializing Database Schema (Lazy) ---');

    for (let attempt = 1; attempt <= retries; attempt++) {
      let conn;
      try {
        conn = await pool.getConnection();

        // Execute schema creations sequentially
        for (const item of schema) {
          await conn.execute(item.sql);
        }

        console.log('--- Database Schema Initialized Successfully ---');
        return true;
      } catch (error) {
        console.error(`Database Initialization Attempt ${attempt} failed:`, error.message);

        if (attempt === retries) {
          console.error('Max retries reached. Database initialization failed.');
          initPromise = null; // Allow a future request to try again
          return false;
        }

        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } finally {
        if (conn) conn.release();
      }
    }
  })();

  return initPromise;
};

module.exports = { ensureTablesExist };
