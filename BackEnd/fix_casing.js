const pool = require('./src/config/db');
const schema = require('./src/utils/schema');

async function fixColumnCasing() {
  const conn = await pool.getConnection();
  try {
    for (const item of schema) {
      const tableName = item.table.toLowerCase();
      
      const [columns] = await conn.query(
        "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1",
        [tableName]
      );
      const existingColumns = columns.map(c => c.column_name);

      if (item.columns) {
        for (const colDef of item.columns) {
          const expectedParams = colDef.name; // e.g., 'lessonId'
          const lowerParams = expectedParams.toLowerCase(); // 'lessonid'

          // If it exists as lowercase but we expect camelcase
          if (expectedParams !== lowerParams && existingColumns.includes(lowerParams)) {
            console.log(`Renaming ${tableName}.${lowerParams} to "${expectedParams}"`);
            await conn.query(`ALTER TABLE "${tableName}" RENAME COLUMN "${lowerParams}" TO "${expectedParams}"`);
          }
        }
      }
    }
    console.log("Column casing fixed successfully!");
  } catch (err) {
    console.error("Error fixing casing:", err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

fixColumnCasing();
