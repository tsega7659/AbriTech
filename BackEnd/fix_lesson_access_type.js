const db = require('./src/config/db');

async function fixLessonAccessType() {
  try {
    console.log("Fixing accessType in lesson table...");

    // Remove the default if it exists
    await db.query(`ALTER TABLE "lesson" ALTER COLUMN "accessType" DROP DEFAULT`);

    // Alter the column to use the new LessonAccessType enum, converting to lowercase
    await db.query(`
      ALTER TABLE "lesson" 
      ALTER COLUMN "accessType" 
      TYPE "LessonAccessType" 
      USING LOWER("accessType"::text)::"LessonAccessType"
    `);

    // Set the default back
    await db.query(`ALTER TABLE "lesson" ALTER COLUMN "accessType" SET DEFAULT 'locked'::"LessonAccessType"`);

    console.log("Fixed accessType casing successfully.");

  } catch (error) {
    console.error("Error modifying column:", error.message);
  } finally {
    process.exit();
  }
}

fixLessonAccessType();
