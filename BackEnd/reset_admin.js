const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function reset() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'abritech',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    const newPassword = 'Admin@123';
    const SALT_ROUNDS = 10;

    try {
        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        console.log('--- Resetting Admin Credentials ---');

        // 1. Update 'admin' user
        const [result1] = await pool.execute(
            'UPDATE user SET passwordHash = ? WHERE username = "admin"',
            [passwordHash]
        );
        console.log(`Updated "admin" user: ${result1.affectedRows} rows affected`);

        // 2. Update 'Admin1' user (which has email adminn@abritech.com)
        // We'll change username to 'adminn' as well to match user's expectation
        const [result2] = await pool.execute(
            'UPDATE user SET username = "adminn", passwordHash = ? WHERE email = "adminn@abritech.com"',
            [passwordHash]
        );
        console.log(`Updated user with email "adminn@abritech.com" (new username: "adminn"): ${result2.affectedRows} rows affected`);

        if (result1.affectedRows === 0 && result2.affectedRows === 0) {
            // If neither exists, let's look for ANY admin and reset one
            const [admins] = await pool.execute('SELECT u.id FROM user u JOIN role r ON u.roleId = r.id WHERE r.name = "admin" LIMIT 1');
            if (admins.length > 0) {
                await pool.execute('UPDATE user SET passwordHash = ? WHERE id = ?', [passwordHash, admins[0].id]);
                console.log(`Reset password for fallback admin with ID: ${admins[0].id}`);
            } else {
                console.log('No admin users found at all!');
            }
        }

    } catch (err) {
        console.error('Error during reset:', err);
    } finally {
        await pool.end();
    }
}

reset();
