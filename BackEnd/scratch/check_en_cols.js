const pool = require('../src/config/db');

async function check() {
  try {
    const [cols] = await pool.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'enrollment'");
    console.log('enrollment columns:', cols.map(c => c.column_name));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
