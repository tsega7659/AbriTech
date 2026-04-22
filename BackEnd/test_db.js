const pool = require('./src/config/db');

async function test() {
    try {
        const res = await pool.execute('SELECT s.id, u.username FROM student s JOIN "user" u ON s."userId" = u.id LIMIT 1');
        if (!res[0][0]) { console.log('No student found'); return; }
        const studentId = res[0][0].id;
        console.log('ID:', studentId);

        const sql = `
            SELECT u.id, u."fullName" as "fullName", u.email, u.username, u."phoneNumber" as "phoneNumber", s."schoolName" as "schoolName"
            FROM "user" u
            JOIN student s ON u.id = s."userId"
            WHERE s.id = ?
        `;
        const details = await pool.execute(sql, [studentId]);
        console.log('DETAILS:', details[0][0]);
    } catch(e) {
        console.error(e)
    } finally {
        process.exit(0);
    }
}
test();
