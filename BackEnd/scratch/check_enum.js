const pool = require('../src/config/db');

async function checkEnum() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      "SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'PaymentStatus' OR pg_type.typname = 'EnrollmentStatus'"
    );
    console.log('Enum Values:', JSON.stringify(rows, null, 2));
    
    // Also check the type name for status column
    const [types] = await conn.query(
      "SELECT udt_name FROM information_schema.columns WHERE table_name = 'payment' AND column_name = 'status'"
    );
    console.log('Status Type Name:', JSON.stringify(types, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

checkEnum();
