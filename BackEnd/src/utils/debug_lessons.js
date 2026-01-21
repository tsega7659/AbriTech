const pool = require('../config/db');
require('dotenv').config();

const debugLessons = async () => {
    try {
        const [courses] = await pool.execute('SELECT id, name FROM course');
        const [total] = await pool.execute('SELECT count(*) as count FROM lesson');

        console.log(`\n\n--- DEBUG REPORT ---`);
        console.log(`Total Lessons in DB: ${total[0].count}`);

        for (const course of courses) {
            const [lessons] = await pool.execute('SELECT id, title FROM lesson WHERE courseId = ?', [course.id]);
            if (lessons.length > 0) {
                console.log(`[FOUND] Course "${course.name}" (ID: ${course.id}) has ${lessons.length} lessons.`);
                lessons.forEach(l => console.log(`   - Lesson ID: ${l.id}, Title: "${l.title}"`));
            }
        }
        console.log(`--- END REPORT ---\n`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
};

debugLessons();
