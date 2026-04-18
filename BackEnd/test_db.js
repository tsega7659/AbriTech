const db = require('./src/config/db');

async function test() {
  const sql = 'INSERT INTO enrollment ("studentId", "courseId", "progressPercentage", status) VALUES (?, ?, 0, ?)';
  const transformed = db.pgPool ? "Has pgPool" : "No pgPool";
  console.log(transformed);
  
  try {
    const poolMock = db;
    const res = await poolMock.execute(sql, [1, 2, 'pending']);
    console.log("Success:", res);
  } catch (e) {
    console.error("Error executing:", e);
  } finally {
    process.exit();
  }
}
test();
