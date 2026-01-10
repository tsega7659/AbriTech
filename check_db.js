const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'BackEnd/.env' });

async function check() {
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
        console.log('--- Roles ---');
        const [roles] = await pool.execute('SELECT * FROM role');
        console.table(roles);

        console.log('\n--- Users ---');
        const [users] = await pool.execute('SELECT id, fullName, username, email, roleId FROM user');
        console.table(users);

        const [adminn] = await pool.execute('SELECT * FROM user WHERE username = "adminn"');
        if (adminn.length > 0) {
            console.log('\n--- Adminn User Found ---');
            console.log(JSON.stringify(adminn[0], null, 2));
        } else {
            console.log('\n--- Adminn User NOT Found ---');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
