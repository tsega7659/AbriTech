const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'abritech_db',
    port: process.env.DB_PORT || 3306,
};

async function migrate() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Add 'type' column
        try {
            await connection.query(`
                ALTER TABLE lesson 
                ADD COLUMN type ENUM('video', 'image', 'text', 'file', 'link') NOT NULL DEFAULT 'link' AFTER title
            `);
            console.log("Added 'type' column.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("'type' column already exists.");
            } else {
                throw e;
            }
        }

        // 2. Add 'contentUrl' column
        try {
            await connection.query(`
                ALTER TABLE lesson 
                ADD COLUMN contentUrl VARCHAR(255) AFTER type
            `);
            console.log("Added 'contentUrl' column.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("'contentUrl' column already exists.");
            } else {
                throw e;
            }
        }

        // 3. Add 'textContent' column
        try {
            await connection.query(`
                ALTER TABLE lesson 
                ADD COLUMN textContent TEXT AFTER contentUrl
            `);
            console.log("Added 'textContent' column.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("'textContent' column already exists.");
            } else {
                throw e;
            }
        }

        console.log('Migration completed successfully.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (connection) await connection.end();
    }
}

migrate();
