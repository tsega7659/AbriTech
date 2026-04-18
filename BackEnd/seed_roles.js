const pool = require('./src/config/db');

async function seedRoles() {
    console.log('--- Seeding Roles ---');
    const roles = ['admin', 'teacher', 'student', 'parent'];

    try {
        for (const role of roles) {
            await pool.execute("INSERT INTO role (name) VALUES (?) ON CONFLICT (name) DO NOTHING", [role]);
            console.log(`Role '${role}' ensured.`);
        }
        console.log('--- Roles Seeded Successfully ---');
    } catch (error) {
        console.error('Error seeding roles:', error);
    } finally {
        process.exit(0);
    }
}

seedRoles();
