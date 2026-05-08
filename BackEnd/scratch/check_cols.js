const pool = require('../src/config/db');

async function check() {
  try {
    const [studentCols] = await pool.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'student'");
    console.log('Student columns:', studentCols.map(c => c.column_name));

    const [userCols] = await pool.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'user'");
    console.log('User columns:', userCols.map(c => c.column_name));
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
