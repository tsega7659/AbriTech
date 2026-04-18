const db = require('./src/config/db');

async function fixEnumCasing() {
  try {
    console.log("Starting database enum casing normalization...");

    const enumsToFix = [
      { name: 'ProjectStatus', values: ['pending', 'approved', 'rejected'], table: 'project', column: 'status', default: 'pending' },
      { name: 'PaymentStatus', values: ['pending', 'success', 'failed'], table: 'payment', column: 'status', default: 'pending' },
      { name: 'EventType', values: ['hackathon', 'summer_camp', 'competition', 'deadline'], table: 'event', column: 'type', default: null }
    ];

    for (const en of enumsToFix) {
      console.log(`Fixing ${en.name}...`);
      
      // Step 1: Create a temporary type with the same values but lowercase
      const valueList = en.values.map(v => `'${v}'`).join(', ');
      await db.query(`DROP TYPE IF EXISTS "${en.name}_temp" CASCADE`);
      await db.query(`CREATE TYPE "${en.name}_temp" AS ENUM (${valueList})`);
      
      // Step 2: Handle default values if they exist
      if (en.default) {
        await db.query(`ALTER TABLE "${en.table}" ALTER COLUMN "${en.column}" DROP DEFAULT`);
      }

      // Step 3: Update the table column to use the temp type
      await db.query(`
        ALTER TABLE "${en.table}" 
        ALTER COLUMN "${en.column}" 
        TYPE "${en.name}_temp" 
        USING LOWER("${en.column}"::text)::"${en.name}_temp"
      `);
      
      // Step 4: Restore the default value with lowercase casing
      if (en.default) {
        await db.query(`ALTER TABLE "${en.table}" ALTER COLUMN "${en.column}" SET DEFAULT '${en.default}'::"${en.name}_temp"`);
      }

      // Step 5: Replace original type with temp one
      await db.query(`DROP TYPE IF EXISTS "${en.name}"`);
      await db.query(`ALTER TYPE "${en.name}_temp" RENAME TO "${en.name}"`);
      
      console.log(`Normalized ${en.name}.`);
    }

    console.log("Database enum casing normalized successfully.");
  } catch (error) {
    console.error("Error normalizing enum casing:", error.message);
  } finally {
    process.exit();
  }
}

fixEnumCasing();
