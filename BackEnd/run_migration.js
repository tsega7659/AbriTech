const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

// Match logic from src/config/db.js
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
    host: process.env.LOCAL_DB_HOST || 'localhost',
    user: process.env.LOCAL_DB_USER || 'root',
    password: process.env.LOCAL_DB_PASSWORD || 'tsega7659',
    database: process.env.LOCAL_DB_NAME || 'abritech_db',
    port: process.env.LOCAL_DB_PORT || 3306,
};

async function migrate() {
    const pool = mysql.createPool({
        ...dbConfig,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        multipleStatements: true
    });

    try {
        console.log(`Running migration on ${dbConfig.host} / ${dbConfig.database}...`);
        const migrationSql = fs.readFileSync('migration_multi_resource.sql', 'utf8');
        await pool.query(migrationSql);
        console.log('Migration successful!');

        // Verify the table exists
        const [columns] = await pool.execute('SHOW COLUMNS FROM lesson_resource');
        console.log('\n--- lesson_resource Columns ---');
        console.table(columns);

        // Verify data migration
        const [count] = await pool.execute('SELECT COUNT(*) as total FROM lesson_resource');
        console.log(`\nMigrated ${count[0].total} resources from existing lessons.`);

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
