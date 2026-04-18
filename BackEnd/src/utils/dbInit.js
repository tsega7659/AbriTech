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
          const tableName = item.table.toLowerCase();

          // Check if table exists (PostgreSQL way)
          const [tables] = await conn.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1",
            [tableName]
          );

          if (tables.length === 0) {
            console.log(`Table '${tableName}' does not exist. Creating...`);
            // Note: item.sql should be PostgreSQL compatible, or we let Prisma handle it.
            // For now, we attempt to run the existing SQL (might need cleanup)
            await conn.query(item.sql);
          } else if (item.columns) {
            // Table exists, check for missing columns
            const [columns] = await conn.query(
              "SELECT column_name as \"Field\", data_type as \"Type\" FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1",
              [tableName]
            );
            const existingColumnNames = columns.map(c => c.Field.toLowerCase());

            for (const colDef of item.columns) {
              const colName = colDef.name.toLowerCase();
              if (!existingColumnNames.includes(colName)) {
                console.log(`Table '${tableName}': Adding missing column '${colName}'`);
                try {
                  // Postgres syntax: ALTER TABLE "name" ADD COLUMN "name" type
                  await conn.query(`ALTER TABLE "${tableName}" ADD COLUMN "${colDef.name}" ${colDef.type}`);
                } catch (alterError) {
                  console.error(`Error adding column '${colDef.name}' to '${tableName}':`, alterError.message);
                }
              } else if (colDef.name === 'lastLogin') {
                // Special check for lastLogin casing (migration fix)
                const actualColumn = columns.find(c => c.Field.toLowerCase() === 'lastlogin');
                if (actualColumn && actualColumn.Field !== 'lastLogin') {
                   console.log(`Table '${tableName}': Correcting casing of 'lastlogin' to 'lastLogin'`);
                   await conn.query(`ALTER TABLE "${tableName}" RENAME COLUMN "${actualColumn.Field}" TO "lastLogin"`);
                }
              }
            }
          }
        }

        console.log('--- Database Schema Initialized Successfully ---');
        return true;
      } catch (error) {
        console.error(`Database Initialization Attempt ${attempt} failed:`, error.message);
        if (attempt === retries) {
          initPromise = null;
          return false;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      } finally {
        if (conn) conn.release();
      }
    }
  })();

  return initPromise;
};

module.exports = { ensureTablesExist };
