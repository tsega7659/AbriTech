const pool = require('./src/config/db');

async function listTables() {
    try {
        const [tables] = await pool.execute(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables in database:');
        tables.forEach(t => console.log(`- ${t.table_name}`));
    } catch (error) {
        console.error('Error listing tables:', error);
    } finally {
        process.exit();
    }
}

listTables();
