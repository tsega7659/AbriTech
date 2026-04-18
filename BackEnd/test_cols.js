const pool = require('./src/config/db');

async function testQuery() {
  try {
    const [cols] = await pool.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'assignmentsubmission'
    `);
    console.log("assignmentsubmission columns:", cols.map(c => c.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

testQuery();
