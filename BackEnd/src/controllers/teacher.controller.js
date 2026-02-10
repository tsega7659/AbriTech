const pool = require('../config/db');

const getAllTeachers = async (req, res) => {
    try {
        const [teachers] = await pool.execute(`
      SELECT 
        u.id, 
        u.fullName, 
        u.email, 
        u.username, 
        u.phoneNumber, 
        u.gender, 
        u.address, 
        t.specialization,
        JSON_ARRAYAGG(c.name) as assignedCourses
      FROM user u
      JOIN teacher t ON u.id = t.userId
      LEFT JOIN teachercourse tc ON u.id = tc.teacherId
      LEFT JOIN course c ON tc.courseId = c.id
      GROUP BY u.id
    `);
        // Robust JSON parsing for environments where JSON_ARRAYAGG returns strings
        const formattedTeachers = teachers.map(t => {
            let assigned = t.assignedCourses;
            if (typeof assigned === 'string') {
                try {
                    assigned = JSON.parse(assigned);
                } catch (e) {
                    assigned = [];
                }
            }
            return {
                ...t,
                // Filter out null values which can occur with LEFT JOINs
                assignedCourses: Array.isArray(assigned) ? assigned.filter(c => c !== null) : []
            };
        });

        res.json(formattedTeachers);
    } catch (error) {
        console.error('Get All Teachers Error:', error);
        res.status(500).json({ message: 'Failed to fetch teachers', error: error.message });
    }
};

const getDashboard = async (req, res) => {
    try {
        const { userId } = req.user; // From auth middleware

        // Get assigned courses count
        const [assignedCourses] = await pool.execute(
            'SELECT COUNT(*) as count FROM teachercourse WHERE teacherId = ?',
            [userId]
        );

        // Get total students across all assigned courses
        const [totalStudents] = await pool.execute(`
            SELECT COUNT(DISTINCT e.studentId) as count
            FROM teachercourse tc
            JOIN enrollment e ON tc.courseId = e.courseId
            WHERE tc.teacherId = ?
        `, [userId]);

        // Get count of lessons/courses assigned to teacher that students have enrolled in
        // and calculate average progress
        const [progressResult] = await pool.execute(`
            SELECT AVG(e.progressPercentage) as average
            FROM teachercourse tc
            JOIN enrollment e ON tc.courseId = e.courseId
            WHERE tc.teacherId = ?
        `, [userId]);
        const averageCompletion = Math.round(progressResult[0].average || 0);

        // Get active assignments count for their courses
        const [assignmentsResult] = await pool.execute(`
            SELECT COUNT(*) as count
            FROM teachercourse tc
            JOIN assignment a ON tc.courseId = a.courseId
            WHERE tc.teacherId = ?
        `, [userId]);
        const activeAssignments = assignmentsResult[0].count;

        res.json({
            assignedCourses: assignedCourses[0].count,
            totalStudents: totalStudents[0].count,
            activeAssignments,
            averageCompletion
        });
    } catch (error) {
        console.error('Get Teacher Dashboard Error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
    }
};

const getAssignedCourses = async (req, res) => {
    try {
        const { userId } = req.user; // From auth middleware

        const [courses] = await pool.execute(`
            SELECT 
                c.id,
                c.name,
                c.description,
                c.image,
                c.level,
                c.category,
                COUNT(DISTINCT e.studentId) as enrolledStudents
            FROM course c
            JOIN teachercourse tc ON c.id = tc.courseId
            LEFT JOIN enrollment e ON c.id = e.courseId
            WHERE tc.teacherId = ?
            GROUP BY c.id
            ORDER BY c.name
        `, [userId]);

        res.json(courses);
    } catch (error) {
        console.error('Get Assigned Courses Error:', error);
        res.status(500).json({ message: 'Failed to fetch assigned courses', error: error.message });
    }
};

const deleteTeacher = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { id } = req.params; // This is the user ID

        await conn.beginTransaction();

        // Check if teacher exists
        const [teacher] = await conn.execute('SELECT id FROM teacher WHERE userId = ?', [id]);
        if (teacher.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // 1. Delete teacher courses
        await conn.execute('DELETE FROM teachercourse WHERE teacherId = ?', [id]);

        // 2. Delete teacher record
        await conn.execute('DELETE FROM teacher WHERE userId = ?', [id]);

        // 3. Delete user record
        await conn.execute('DELETE FROM user WHERE id = ?', [id]);

        await conn.commit();
        res.json({ message: 'Teacher and associated records deleted successfully' });
    } catch (error) {
        await conn.rollback();
        console.error('Delete Teacher Error:', error);
        res.status(500).json({ message: 'Failed to delete teacher', error: error.message });
    } finally {
        conn.release();
    }
};

const getEnrolledStudents = async (req, res) => {
    try {
        const { userId } = req.user; // Teacher's userId
        const { courseId } = req.query;

        let query = `
            SELECT 
                u.id,
                u.fullName,
                u.email,
                JSON_ARRAYAGG(c.name) as enrolledCourses,
                AVG(e.progressPercentage) as avgProgress
            FROM user u
            JOIN student s ON u.id = s.userId
            JOIN enrollment e ON s.id = e.studentId
            JOIN course c ON e.courseId = c.id
            JOIN teachercourse tc ON c.id = tc.courseId
            WHERE tc.teacherId = ?
        `;

        const params = [userId];

        if (courseId) {
            query += " AND c.id = ? ";
            params.push(courseId);
        }

        query += " GROUP BY u.id";

        const [students] = await pool.execute(query, params);

        // Robust JSON parsing for environments where JSON_ARRAYAGG returns strings
        const formattedStudents = students.map(s => {
            let enrolled = s.enrolledCourses;
            if (typeof enrolled === 'string') {
                try {
                    enrolled = JSON.parse(enrolled);
                } catch (e) {
                    enrolled = [];
                }
            }
            return {
                ...s,
                enrolledCourses: Array.isArray(enrolled) ? enrolled.filter(c => c !== null) : []
            };
        });

        res.json(formattedStudents);
    } catch (error) {
        console.error('Get Enrolled Students Error:', error);
        res.status(500).json({ message: 'Failed to fetch students', error: error.message });
    }
};

const getStudentCourseDetail = async (req, res) => {
    try {
        const { studentId, courseId } = req.params;
        const { userId: teacherId } = req.user;

        // Verify this teacher is actually teaching this course
        const [teachingCheck] = await pool.execute(
            'SELECT id FROM teachercourse WHERE teacherId = ? AND courseId = ?',
            [teacherId, courseId]
        );

        if (teachingCheck.length === 0) {
            return res.status(403).json({ message: 'Unauthorized. You do not teach this course.' });
        }

        // Get student basic info and progress in this specific course
        const [studentInfo] = await pool.execute(`
            SELECT 
                u.fullName, u.email,
                e.progressPercentage, e.status, e.enrolledAt,
                s.schoolName, s.classLevel
            FROM user u
            JOIN student s ON u.id = s.userId
            JOIN enrollment e ON s.id = e.studentId
            WHERE u.id = ? AND e.courseId = ?
        `, [studentId, courseId]);

        if (studentInfo.length === 0) {
            return res.status(404).json({ message: 'Student enrollment not found' });
        }

        // Get project submissions for this student and course
        const [submissions] = await pool.execute(`
            SELECT 
                sub.id, sub.submissionType, sub.submissionContent, sub.status, sub.result, sub.feedback, sub.submittedAt,
                a.title as assignmentTitle, a.description as assignmentDescription
            FROM assignmentsubmission sub
            JOIN assignment a ON sub.assignmentId = a.id
            JOIN student s ON sub.studentId = s.id
            AND s.userId = ? AND a.courseId = ? AND sub.status != 'draft'
            ORDER BY sub.submittedAt DESC
        `, [studentId, courseId]);

        // Get quiz results for this student and course
        const [quizResults] = await pool.execute(`
            SELECT 
                l.title as lessonTitle,
                SUM(qa.isCorrect) as correctAnswers,
                COUNT(qa.id) as totalQuestions,
                MAX(qa.attemptedAt) as attemptedAt
            FROM lesson l
            JOIN lessonquiz lq ON l.id = lq.lessonId
            JOIN quizattempt qa ON lq.id = qa.quizId
            JOIN student s ON qa.studentId = s.id
            WHERE s.userId = ? AND l.courseId = ?
            GROUP BY l.id
        `, [studentId, courseId]);

        res.json({
            student: studentInfo[0],
            submissions,
            quizzes: quizResults.map(q => ({
                lessonTitle: q.lessonTitle,
                score: Math.round((q.correctAnswers / q.totalQuestions) * 100),
                date: q.attemptedAt
            }))
        });
    } catch (error) {
        console.error('Get Student Course Detail Error:', error);
        res.status(500).json({ message: 'Failed to fetch student details', error: error.message });
    }
};

const getAllSubmissions = async (req, res) => {
    try {
        const { userId: teacherId } = req.user;

        const [submissions] = await pool.execute(`
            SELECT 
                sub.id, sub.submissionType, sub.submissionContent, sub.status, sub.result, sub.feedback, sub.submittedAt,
                a.title as assignmentTitle,
                c.name as courseName,
                u.fullName as studentName,
                u.email as studentEmail
            FROM assignmentsubmission sub
            JOIN assignment a ON sub.assignmentId = a.id
            JOIN course c ON a.courseId = c.id
            JOIN teachercourse tc ON c.id = tc.courseId
            JOIN student s ON sub.studentId = s.id
            JOIN user u ON s.userId = u.id
            WHERE tc.teacherId = ? AND sub.status != 'draft'
            ORDER BY sub.submittedAt DESC
        `, [teacherId]);

        res.json(submissions);
    } catch (error) {
        console.error('Get All Submissions Error:', error);
        res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
    }
};

module.exports = {
    getAllTeachers,
    getDashboard,
    getAssignedCourses,
    getEnrolledStudents,
    getStudentCourseDetail,
    getAllSubmissions,
    deleteTeacher
};

