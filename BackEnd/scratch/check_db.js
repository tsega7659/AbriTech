const pool = require('../src/config/db');

async function checkTable() {
  const conn = await pool.getConnection();
  try {
    const [columns] = await conn.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'payment'"
    );
    console.log('Payment Columns:', JSON.stringify(columns, null, 2));
    
    const [enrollColumns] = await conn.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'enrollment'"
    );
    console.log('Enrollment Columns:', JSON.stringify(enrollColumns, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

checkTable();
