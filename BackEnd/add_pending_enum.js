const db = require('./src/config/db');

async function addPendingEnum() {
  try {
    // Add 'pending' to the enrollment status enum
    await db.query(`ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'pending'`);
    console.log("Added 'pending' to EnrollmentStatus enum successfully!");
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    process.exit();
  }
}
addPendingEnum();
