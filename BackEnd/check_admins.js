const pool = require('./src/config/db');

async function checkAdmins() {
    try {
        const [admins] = await pool.execute(`
            SELECT u.id, u.username, u.email, r.name as role
            FROM "user" u
            JOIN role r ON u."roleId" = r.id
            WHERE r.name = 'admin'
        `);
        console.log('Admin users currently in database:');
        admins.forEach(a => console.log(`- ${a.username} (${a.email})`));
    } catch (error) {
        console.error('Error checking admins:', error);
    } finally {
        process.exit();
    }
}

checkAdmins();
