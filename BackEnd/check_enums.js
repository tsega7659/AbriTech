const db = require('./src/config/db');

async function check() {
  try {
    const [rows] = await db.query(`
      SELECT t.typname, e.enumlabel 
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      WHERE t.typname IN (
        'SubmissionStatus', 'submissionstatus', 
        'ProjectStatus', 'projectstatus', 
        'PaymentStatus', 'paymentstatus', 
        'LessonAccessType', 'lessonaccesstype', 
        'EventType', 'eventtype'
      )
      ORDER BY t.typname, e.enumlabel
    `);
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    process.exit();
  }
}

check();
