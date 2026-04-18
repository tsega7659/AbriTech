const pool = require('./src/config/db');

async function findCamelColumns() {
  try {
    const [columns] = await pool.execute(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND column_name ~ '[A-Z]'
    `);
    
    const camelColumns = columns.map(c => c.column_name);
    const uniqueCamelColumns = [...new Set(camelColumns)];
    
    console.log("Camel case columns in DB:");
    console.log(JSON.stringify(uniqueCamelColumns, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

findCamelColumns();
