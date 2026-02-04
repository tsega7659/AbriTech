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
          const [tables] = await conn.query(`SHOW TABLES LIKE ?`, [tableName]);

          if (tables.length === 0) {
            console.log(`Table '${tableName}' does not exist. Creating...`);
            await conn.query(item.sql);
          } else if (item.columns) {
            // Table exists, check for missing columns
            const [columns] = await conn.query(`SHOW COLUMNS FROM ??`, [tableName]);
            const existingColumnNames = columns.map(c => c.Field);

            for (const colDef of item.columns) {
              if (!existingColumnNames.includes(colDef.name)) {
                console.log(`Table '${tableName}': Adding missing column '${colDef.name}'`);
                try {
                  await conn.query(`ALTER TABLE ?? ADD COLUMN ${colDef.name} ${colDef.type}`, [tableName]);
                } catch (alterError) {
                  console.error(`Error adding column '${colDef.name}' to '${tableName}':`, alterError.message);
                }
              }
            }
          } else {
            // Fallback for tables without structured column definitions in schema.js
            // Just run the CREATE TABLE IF NOT EXISTS as a safety measure
            await conn.query(item.sql);
          }
        }

        console.log('--- Database Schema Initialized Successfully ---');

        // Post-initialization migration: Move existing lesson content to lesson_resource if applicable
        try {
          const [resources] = await conn.query('SELECT COUNT(*) as count FROM lesson_resource');
          if (resources[0].count === 0) {
            console.log('lesson_resource table is empty. Checking for legacy content in lesson table...');

            // Check if legacy columns exist in lesson table
            const [lessonCols] = await conn.query('SHOW COLUMNS FROM lesson');
            const colNames = lessonCols.map(c => c.Field);

            if (colNames.includes('type') && (colNames.includes('contentUrl') || colNames.includes('textContent'))) {
              console.log('Legacy content found. Migrating to lesson_resource...');
              await conn.query(`
                INSERT INTO lesson_resource (lessonId, type, contentUrl, textContent, orderNumber)
                SELECT id, type, contentUrl, textContent, 1
                FROM lesson
                WHERE type IS NOT NULL AND (contentUrl IS NOT NULL OR textContent IS NOT NULL)
              `);
              console.log('Data migration to lesson_resource completed.');
            }
          }
        } catch (migrationError) {
          console.error('Data migration skipped or failed:', migrationError.message);
        }

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
