const pool = require('../src/config/db');

async function checkColumns() {
  try {
    const [columns] = await pool.execute(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'payment'
    `);
    console.log('Payment Columns:', JSON.stringify(columns, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkColumns();
