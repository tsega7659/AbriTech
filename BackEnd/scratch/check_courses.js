const pool = require('../src/config/db');

async function checkCourses() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query("SELECT id, name, price, \"discountPrice\", \"hasDiscount\", \"isFree\" FROM course WHERE id = 6");
    console.log('Courses:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

checkCourses();
