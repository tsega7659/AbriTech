const pool = require('./src/config/db.js');

async function run() {
  try {
    const [rows] = await pool.query("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'lesson'");
    console.log("Lesson Table Columns:");
    console.table(rows);
    
    // Also check what values are in LessonAccessType_old
    const [enums] = await pool.query(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname IN ('LessonAccessType', 'LessonAccessType_old', 'lessonaccesstype', 'lessonaccesstype_old', 'LessonAccessType_new');
    `);
    console.log("Enum values:");
    console.table(enums);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
