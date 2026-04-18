const db = require('./src/config/db');

async function updateSchema() {
  try {
    console.log("Starting database schema updates...");

    // 1. Add 'draft' to SubmissionStatus enum
    // We check if it exists by trying to add it and catching the error if it already exists, 
    // or we can query pg_enum (more robust).
    const [enums] = await db.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'SubmissionStatus' OR typname = 'submissionstatus')
    `);
    
    const existingLabels = enums.map(r => r.enumlabel);
    
    if (!existingLabels.includes('draft')) {
      await db.query(`ALTER TYPE "SubmissionStatus" ADD VALUE 'draft'`);
      console.log("Added 'draft' to SubmissionStatus enum.");
    } else {
      console.log("'draft' already exists in SubmissionStatus enum.");
    }

    // 2. Initialize some badges if table exists and is empty
    const [badgeTable] = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'badge'
      )
    `);

    if (badgeTable[0].exists) {
      const [existingBadges] = await db.query('SELECT COUNT(*) as count FROM badge');
      if (parseInt(existingBadges[0].count) === 0) {
        console.log("Initializing default badges...");
        await db.query(`
          INSERT INTO badge (name, description, image) VALUES 
          ('Quick Learner', 'Completed your first course!', 'https://res.cloudinary.com/dswurdp5b/image/upload/v1712497000/badges/quick_learner.png'),
          ('Quiz Master', 'Scored 100% on a quiz.', 'https://res.cloudinary.com/dswurdp5b/image/upload/v1712497000/badges/quiz_master.png'),
          ('Project Pro', 'Had a project approved.', 'https://res.cloudinary.com/dswurdp5b/image/upload/v1712497000/badges/project_pro.png')
        `);
        console.log("Default badges initialized.");
      }
    }

    console.log("Schema updates completed successfully.");
  } catch (error) {
    console.error("Error updating schema:", error.message);
  } finally {
    process.exit();
  }
}

updateSchema();
