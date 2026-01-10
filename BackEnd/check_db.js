const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

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

    let output = '';

    try {
        const [roles] = await pool.execute('SELECT * FROM role');
        output += '--- Roles ---\n';
        output += JSON.stringify(roles, null, 2) + '\n\n';

        const [users] = await pool.execute('SELECT u.id, u.fullName, u.username, u.email, u.roleId, r.name as roleName FROM user u LEFT JOIN role r ON u.roleId = r.id');
        output += '--- Users with Roles ---\n';
        output += JSON.stringify(users, null, 2) + '\n\n';

        const [allUsersRaw] = await pool.execute('SELECT id, fullName, username, email, roleId FROM user');
        output += '--- All Users (Raw) ---\n';
        output += JSON.stringify(allUsersRaw, null, 2) + '\n\n';

        fs.writeFileSync('db_output.json', output);
        console.log('Results written to db_output.json');

    } catch (err) {
        console.error('Error during check:', err);
    } finally {
        await pool.end();
    }
}

check();
