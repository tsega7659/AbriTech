const pool = require('./src/config/db');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

async function clearAll() {
    const conn = await pool.getConnection();
    try {
        console.log('--- Starting Database and Cloudinary Cleanup ---');

        // 1. Fetch Admin User IDs to preserve
        const [admins] = await conn.execute(`
            SELECT u.id FROM "user" u
            JOIN role r ON u."roleId" = r.id
            WHERE r.name = 'admin'
        `);
        const adminIds = admins.map(a => a.id);
        console.log(`Found ${adminIds.length} admin accounts to preserve.`);

        if (adminIds.length === 0) {
            console.error('CRITICAL: No admin accounts found. Aborting to prevent lockout.');
            return;
        }

        await conn.beginTransaction();

        // 2. Clear Tables in Order
        const tablesToClear = [
            'parentstudent', 'enrollment', 'lessonprogress', 'quizattempt', 
            'assignmentsubmission', 'payment', 'portfolio', 'certificate', 
            'eventregistration', 'userbadge', 'achievement', 'learning_log',
            'lessonaisummary', 'aichatlog', 'notification', 'contactmessage', 
            'lesson_resource', 'project', 'assignment', 'lessonquiz', 
            'teachercourse', 'lesson', 'course', 'event', 'blog', 'badge', 
            'student', 'parent', 'teacher'
        ];

        for (const table of tablesToClear) {
            const [result] = await conn.execute(`DELETE FROM "${table}"`);
            console.log(`Cleared table: ${table} (${result.affectedRows || result.length || 0} rows deleted)`);
        }

        // 3. Clear non-admin users
        const placeholders = adminIds.map(() => '?').join(',');
        const [userResult] = await conn.execute(
            `DELETE FROM "user" WHERE id NOT IN (${placeholders})`,
            adminIds
        );
        console.log(`Cleared non-admin users: ${userResult.affectedRows || userResult.length || 0} users deleted.`);

        await conn.commit();
        console.log('--- Database Cleanup Completed Successfully ---');

        // 4. Cloudinary Wipe
        console.log('--- Starting Cloudinary Wipe ---');
        
        // Delete all resources (images and videos)
        await new Promise((resolve, reject) => {
            cloudinary.api.delete_all_resources((error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
        console.log('Cloudinary: All resources deleted.');

        // Delete all folders (Cloudinary folders must be empty to be deleted)
        // We'll fetch root folders and delete them if possible
        const { folders } = await cloudinary.api.root_folders();
        for (const folder of folders) {
            await cloudinary.api.delete_folder(folder.name).catch(e => {
                console.warn(`Could not delete folder ${folder.name}: ${e.message}`);
            });
        }
        console.log('Cloudinary: Folders cleared.');

        console.log('--- ALL CLEANUP TASKS COMPLETED ---');

    } catch (error) {
        if (conn) await conn.rollback();
        console.error('CLEANUP FAILED:', error);
    } finally {
        if (conn) conn.release();
        process.exit();
    }
}

// Confirmation check
console.log('WARNING: This will delete ALL data except admin accounts.');
console.log('Executing in 3 seconds...');
setTimeout(clearAll, 3000);
