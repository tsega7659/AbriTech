const pool = require('../src/config/db');

async function checkData() {
  try {
    const [courses] = await pool.execute('SELECT id, name, price, "isFree", "hasDiscount", "discountPrice" FROM course LIMIT 5');
    console.log('Courses:', JSON.stringify(courses, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
