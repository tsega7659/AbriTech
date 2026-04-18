const pool = require('./src/config/db');
async function check() {
  try {
    const courseId = 4;
    const [courses] = await pool.execute('SELECT "isFree" FROM course WHERE id = ?', [courseId]);
    console.log("Returned row:", courses[0]);
    console.log("Type of isFree:", typeof courses[0].isFree);
    const isFree = courses[0].isFree;
    const initialStatus = isFree ? 'active' : 'pending';
    console.log("Resulting status:", initialStatus);
  } catch(e) { console.error(e) }
  finally { if(pool.end) await pool.end(); else process.exit(0); }
}
check();
