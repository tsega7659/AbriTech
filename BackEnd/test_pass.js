const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function testPassword() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'abritech',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

   

    try {
        for (const username of usernames) {
            const [users] = await pool.execute('SELECT passwordHash FROM user WHERE username = ?', [username]);
            if (users.length > 0) {
                const isMatch = await bcrypt.compare(passwordToTest, users[0].passwordHash);
                console.log(`Password "${passwordToTest}" for username "${username}": ${isMatch ? 'MATCH' : 'NO MATCH'}`);
            } else {
                console.log(`Username "${username}" not found`);
            }
        }

        // Also check email adminn@abritech.com
        const [usersByEmail] = await pool.execute('SELECT passwordHash, username FROM user WHERE email = "adminn@abritech.com"');
        if (usersByEmail.length > 0) {
            const isMatch = await bcrypt.compare(passwordToTest, usersByEmail[0].passwordHash);
            console.log(`Password "${passwordToTest}" for email "adminn@abritech.com" (username: ${usersByEmail[0].username}): ${isMatch ? 'MATCH' : 'NO MATCH'}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

testPassword();
