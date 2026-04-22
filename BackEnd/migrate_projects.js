const pool = require('./src/config/db');

async function migrate() {
    try {
        console.log('Adding courseId to project table...');
        await pool.execute('ALTER TABLE project ADD COLUMN IF NOT EXISTS "courseId" BIGINT REFERENCES course(id) ON DELETE SET NULL');
        console.log('Success!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
