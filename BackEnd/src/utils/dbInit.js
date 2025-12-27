// src/utils/dbInit.js
const pool = require('../config/db');
const schema = require('./schema');

let isInitialized = false;

/**
 * Ensures all required tables exist in the database.
 * This can be called at the start of any database operation.
 * It uses a local flag to ensure the check only runs once per server instance lifecycle.
 */
const ensureTablesExist = async () => {
    if (isInitialized) return;

    console.log('--- Initializing Database Schema ---');
    const conn = await pool.getConnection();
    try {
        for (const item of schema) {
            // console.log(`Ensuring table exists: ${item.table}`);
            await conn.execute(item.sql);
        }
        isInitialized = true;
        console.log('--- Database Schema Initialized Successfully ---');
    } catch (error) {
        console.error('Database Initialization Error:', error);
        // We don't throw here to allow subsequent attempts, 
        // but ideally the app should handle this.
    } finally {
        conn.release();
    }
};

module.exports = { ensureTablesExist };
