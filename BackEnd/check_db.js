const pool = require('./src/config/db');
const fs = require('fs');
require('dotenv').config();

async function check() {
    let output = '';

    try {
        const [roles] = await pool.execute('SELECT * FROM role');
        output += '--- Roles ---\n';
        output += JSON.stringify(roles, null, 2) + '\n\n';

        const [users] = await pool.execute('SELECT u.id, u."fullName", u.username, u.email, u."roleId", r.name as roleName FROM "user" u LEFT JOIN role r ON u."roleId" = r.id');
        output += '--- Users with Roles ---\n';
        output += JSON.stringify(users, null, 2) + '\n\n';

        const [allUsersRaw] = await pool.execute('SELECT id, "fullName", username, email, "roleId" FROM "user"');
        output += '--- All Users (Raw) ---\n';
        output += JSON.stringify(allUsersRaw, null, 2) + '\n\n';

        fs.writeFileSync('db_output.json', output);
        console.log('Results written to db_output.json');

        // Check Blog columns (Postgres way)
        const [blogColumns] = await pool.execute(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'blog'"
        );
        console.log('\n--- Blog Table Columns ---');
        console.log(JSON.stringify(blogColumns, null, 2));

        // Check Course columns
        const [courseColumns] = await pool.execute(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'course'"
        );
        console.log('\n--- Course Table Columns ---');
        console.log(JSON.stringify(courseColumns, null, 2));

    } catch (err) {
        console.error('Error during check:', err);
    } finally {
        process.exit(0);
    }
}

check();
