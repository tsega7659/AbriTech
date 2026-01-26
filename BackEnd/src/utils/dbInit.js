// src/utils/dbInit.js
const pool = require('../config/db');
const schema = require('./schema');

let initPromise = null;

/**
 * Ensures that all tables and columns defined in the schema exist in the database.
 * This runs lazily and only once per server lifecycle.
 * It includes logic to add missing columns to existing tables.
 */
const ensureTablesExist = async (retries = 3, delay = 2000) => {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    console.log('--- Initializing Database Schema (Sync) ---');

    for (let attempt = 1; attempt <= retries; attempt++) {
      let conn;
      try {
        conn = await pool.getConnection();

        for (const item of schema) {
          const tableName = item.table;

          // Check if table exists
          const [tables] = await conn.execute(`SHOW TABLES LIKE ?`, [tableName]);

          if (tables.length === 0) {
            console.log(`Table '${tableName}' does not exist. Creating...`);
            await conn.execute(item.sql);
          } else if (item.columns) {
            // Table exists, check for missing columns
            const [columns] = await conn.execute(`SHOW COLUMNS FROM ??`, [tableName]);
            const existingColumnNames = columns.map(c => c.Field);

            for (const colDef of item.columns) {
              if (!existingColumnNames.includes(colDef.name)) {
                console.log(`Table '${tableName}': Adding missing column '${colDef.name}'`);
                try {
                  await conn.execute(`ALTER TABLE ?? ADD COLUMN ${colDef.name} ${colDef.type}`, [tableName]);
                } catch (alterError) {
                  console.error(`Error adding column '${colDef.name}' to '${tableName}':`, alterError.message);
                }
              }
            }
          } else {
            // Fallback for tables without structured column definitions in schema.js
            // Just run the CREATE TABLE IF NOT EXISTS as a safety measure
            await conn.execute(item.sql);
          }
        }

        console.log('--- Database Schema Initialized Successfully ---');
        return true;
      } catch (error) {
        console.error(`Database Initialization Attempt ${attempt} failed:`, error.message);

        if (attempt === retries) {
          console.error('Max retries reached. Database initialization failed.');
          initPromise = null;
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
