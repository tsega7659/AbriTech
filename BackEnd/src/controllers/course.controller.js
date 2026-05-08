const pool = require('../config/db');
const courseService = require('../services/course.service');

const getAllCourses = async (req, res) => {
  try {
    const [courses] = await pool.execute(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM enrollment e WHERE e."courseId" = c.id) as enrolledStudents,
             (SELECT COUNT(*) FROM lesson l WHERE l."courseId" = c.id) as lessonCount
      FROM course c
    `);
    res.json(courses);
  } catch (error) {
    console.error('Get All Courses Error:', error);
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { 
      name, category, level, description, duration, 
      price, isFree, hasDiscount, discountPrice, hasScholarship 
    } = req.body;

    // Handle Image Upload
    let imageUrl = '';
    if (req.file) {
      imageUrl = req.file.path;
    }

    // Basic Validation
    if (!name || !category || !level) {
      return res.status(400).json({ message: 'Name, Category, and Level are required.' });
    }

    // Placeholder for youtubeLink as per instruction
    const youtubeLink = '#lesson-video-links';

    const [result] = await pool.execute(
      'INSERT INTO course (name, category, level, "youtubeLink", image, description, duration, price, "isFree", "hasDiscount", "discountPrice", "hasScholarship") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id',
      [
        name, category, level, youtubeLink, imageUrl || null, description || null, 
        duration || null, price || 0, 
        isFree === 'true' || isFree === true, 
        hasDiscount === 'true' || hasDiscount === true, 
        discountPrice || null, 
        hasScholarship === 'true' || hasScholarship === true
      ]
    );

    res.status(201).json({
      message: 'Course created successfully',
      courseId: result[0].id,
      course: { 
        id: result[0].id, name, category, level, youtubeLink, image: imageUrl, description,
        duration, price, isFree, hasDiscount, discountPrice, hasScholarship
      }
    });

  } catch (error) {
    console.error('Create Course Error:', error);
    res.status(500).json({ message: 'Failed to create course', error: error.message });
  }
};

const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { userId } = req.user; // From auth middleware

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Get student ID from userId
    const [students] = await pool.execute('SELECT id FROM student WHERE "userId" = ?', [userId]);
    if (students.length === 0) {
      return res.status(403).json({ message: 'Access denied. Not a student account.' });
    }
    const studentId = students[0].id;

    // Check if already enrolled
    const [existing] = await pool.execute(
      'SELECT id FROM enrollment WHERE "studentId" = ? AND "courseId" = ?',
      [studentId, courseId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Fetch course details using centralized service
    const course = await courseService.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const isFree = course.isFree;
    const initialStatus = isFree ? 'active' : 'pending';

    // Enroll student
    await pool.execute(
      'INSERT INTO enrollment ("studentId", "courseId", "progressPercentage", status) VALUES (?, ?, 0, ?)',
      [studentId, courseId, initialStatus]
    );

    res.status(200).json({ 
      message: isFree ? 'Successfully enrolled in course' : 'Enrolled in Free Preview. Payment required for full access.',
      status: initialStatus
    });

  } catch (error) {
    console.error('Enroll Course Error:', error);
    res.status(500).json({ message: 'Failed to enroll in course', error: error.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, category, level, description, duration, 
      price, isFree, hasDiscount, discountPrice, hasScholarship 
    } = req.body;
    let imageUrl = req.file ? req.file.path : undefined;

    // Check if course exists
    const [existing] = await pool.execute('SELECT * FROM course WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Prepare update query
    let query = 'UPDATE course SET ';
    const params = [];

    if (name) {
      query += 'name = ?, ';
      params.push(name);
    }
    if (category) {
      query += 'category = ?, ';
      params.push(category);
    }
    if (level) {
      query += 'level = ?, ';
      params.push(level);
    }
    if (description) {
      query += 'description = ?, ';
      params.push(description);
    }
    if (imageUrl) {
      query += 'image = ?, ';
      params.push(imageUrl);
    }
    if (duration !== undefined) {
      query += 'duration = ?, ';
      params.push(duration);
    }
    if (price !== undefined) {
      query += 'price = ?, ';
      params.push(price);
    }
    if (isFree !== undefined) {
      query += '"isFree" = ?, ';
      params.push(isFree === 'true' || isFree === true);
    }
    if (hasDiscount !== undefined) {
      query += '"hasDiscount" = ?, ';
      params.push(hasDiscount === 'true' || hasDiscount === true);
    }
    if (discountPrice !== undefined) {
      query += '"discountPrice" = ?, ';
      params.push(discountPrice);
    }
    if (hasScholarship !== undefined) {
      query += '"hasScholarship" = ?, ';
      params.push(hasScholarship === 'true' || hasScholarship === true);
    }

    // If no fields to update
    if (params.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Remove trailing comma and space
    query = query.slice(0, -2);
    query += ' WHERE id = ?';
    params.push(id);

    await pool.execute(query, params);
    const [updatedCourse] = await pool.execute('SELECT * FROM course WHERE id = ?', [id]);

    res.json({ message: 'Course updated successfully', course: updatedCourse[0] });
  } catch (error) {
    console.error('Update Course Error:', error);
    res.status(500).json({ message: 'Failed to update course', error: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course exists
    const [existing] = await pool.execute('SELECT * FROM course WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Use a transaction connection to delete dependent records safely
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Delete TeacherCourse
      await connection.execute('DELETE FROM teachercourse WHERE "courseId" = ?', [id]);

      // 2. Delete Payments
      await connection.execute('DELETE FROM payment WHERE "courseId" = ?', [id]);

      // 3. Delete Projects
      await connection.execute('DELETE FROM project WHERE "courseId" = ?', [id]);

      // 4. Delete Enrollments and related Certificates
      const [enrollments] = await connection.execute('SELECT id FROM enrollment WHERE "courseId" = ?', [id]);
      for (const e of enrollments) {
        await connection.execute('DELETE FROM certificate WHERE "enrollmentId" = ?', [e.id]);
        await connection.execute('DELETE FROM enrollment WHERE id = ?', [e.id]);
      }

      // 5. Delete Assignments and related Submissions
      const [assignments] = await connection.execute('SELECT id FROM assignment WHERE "courseId" = ?', [id]);
      for (const a of assignments) {
        await connection.execute('DELETE FROM assignmentsubmission WHERE "assignmentId" = ?', [a.id]);
        await connection.execute('DELETE FROM assignment WHERE id = ?', [a.id]);
      }

      // 6. Delete Lessons and related records
      const [lessons] = await connection.execute('SELECT id FROM lesson WHERE "courseId" = ?', [id]);
      for (const l of lessons) {
        await connection.execute('DELETE FROM lessonprogress WHERE "lessonId" = ?', [l.id]);
        await connection.execute('DELETE FROM aichatlog WHERE "lessonId" = ?', [l.id]);
        await connection.execute('DELETE FROM lessonaisummary WHERE "lessonId" = ?', [l.id]);

        const [quizzes] = await connection.execute('SELECT id FROM lessonquiz WHERE "lessonId" = ?', [l.id]);
        for (const q of quizzes) {
          await connection.execute('DELETE FROM quizattempt WHERE "quizId" = ?', [q.id]);
          await connection.execute('DELETE FROM lessonquiz WHERE id = ?', [q.id]);
        }
        await connection.execute('DELETE FROM lesson WHERE id = ?', [l.id]);
      }

      // Finally, delete the Course
      await connection.execute('DELETE FROM course WHERE id = ?', [id]);

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete Course Error:', error);
    res.status(500).json({ message: 'Failed to delete course', error: error.message });
  }
};

module.exports = {
  getAllCourses,
  createCourse,
  enrollCourse,
  updateCourse,
  deleteCourse
};
