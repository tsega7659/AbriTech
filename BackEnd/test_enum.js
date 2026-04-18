const db = require('./src/config/db');

async function checkEnum() {
  try {
    const [rows] = await db.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enrollment_status' OR typname = 'EnrollmentStatus')
    `);
    console.log(rows);
  } catch(e) { console.error(e); }
  process.exit();
}
checkEnum();
